import { prisma } from '../../infra/database/prisma.client';
import type {
  CompanyGroupSettings,
  CompanyPersonSettings,
  CompanyProductSettings,
  CompanySettings,
  CompanySummary,
  CompanyTeamSettings,
  UpdateCompanySettingsInput,
} from './settings.types';

type CompanyPersonRecord = {
  id: string;
  email: string;
  role: string | null;
  reportsToEmail: string | null;
};

type CompanyGroupRecord = {
  id: string;
  name: string;
  about: string | null;
  people: CompanyPersonRecord[];
};

type CompanyTeamRecord = {
  id: string;
  name: string;
  about: string | null;
  people: CompanyPersonRecord[];
  groups: CompanyGroupRecord[];
};

type CompanyProductRecord = {
  id: string;
  name: string;
  about: string;
  solutionObjective: string;
  technology: string;
  targetAudience: string;
  averagePrice: string;
};

type CompanySettingsRecord = {
  id: string;
  name: string;
  about: string;
  objectives: string;
  culture: string;
  products: CompanyProductRecord[];
  teams: CompanyTeamRecord[];
};

function mapPerson(person: CompanyPersonRecord): CompanyPersonSettings {
  return {
    id: person.id,
    email: person.email,
    role: person.role ?? undefined,
    reportsToEmail: person.reportsToEmail ?? undefined,
  };
}

function mapGroup(group: CompanyGroupRecord): CompanyGroupSettings {
  return {
    id: group.id,
    name: group.name,
    about: group.about ?? undefined,
    people: group.people.map(mapPerson),
  };
}

function mapTeam(team: CompanyTeamRecord): CompanyTeamSettings {
  return {
    id: team.id,
    name: team.name,
    about: team.about ?? undefined,
    people: team.people.map(mapPerson),
    groups: team.groups.map(mapGroup),
  };
}

function mapCompany(company: CompanySettingsRecord): CompanySettings {
  return {
    company: {
      id: company.id,
      name: company.name,
      about: company.about,
      objectives: company.objectives,
      culture: company.culture,
    },
    products: company.products.map((product) => ({
      id: product.id,
      name: product.name,
      about: product.about,
      solutionObjective: product.solutionObjective,
      technology: product.technology,
      targetAudience: product.targetAudience,
      averagePrice: product.averagePrice,
    })),
    teams: company.teams.map(mapTeam),
  };
}

export async function findCompanies(): Promise<CompanySummary[]> {
  const companies = await prisma.company.findMany({
    orderBy: {
      createdAt: 'asc',
    },
    select: {
      id: true,
      name: true,
    },
  });

  return companies;
}

export async function findCompanyById(companyId: string): Promise<CompanySummary | null> {
  return prisma.company.findUnique({
    where: {
      id: companyId,
    },
    select: {
      id: true,
      name: true,
    },
  });
}

export async function createCompany(name: string): Promise<CompanySummary> {
  const user = await prisma.user.upsert({
    where: {
      email: 'system@noster.local',
    },
    update: {},
    create: {
      name: 'NOSTER',
      email: 'system@noster.local',
    },
  });

  const company = await prisma.company.create({
    data: {
      name,
      members: {
        create: {
          role: 'owner',
          userId: user.id,
        },
      },
    },
    select: {
      id: true,
      name: true,
    },
  });

  return company;
}

export async function deleteCompany(companyId: string) {
  await prisma.company.delete({
    where: {
      id: companyId,
    },
  });

  return findCompanies();
}

async function findCompanySettingsRecord(companyId: string) {
  return prisma.company.findUnique({
    where: {
      id: companyId,
    },
    include: {
      products: {
        orderBy: {
          createdAt: 'asc',
        },
      },
      teams: {
        orderBy: {
          createdAt: 'asc',
        },
        include: {
          people: {
            where: {
              groupId: null,
            },
            orderBy: {
              createdAt: 'asc',
            },
          },
          groups: {
            orderBy: {
              createdAt: 'asc',
            },
            include: {
              people: {
                orderBy: {
                  createdAt: 'asc',
                },
              },
            },
          },
        },
      },
    },
  });
}

export async function findCompanySettings(companyId: string) {
  const company = await findCompanySettingsRecord(companyId);

  if (!company) {
    return null;
  }

  return mapCompany(company);
}

function productData(product: CompanyProductSettings) {
  return {
    name: product.name,
    about: product.about,
    solutionObjective: product.solutionObjective,
    technology: product.technology,
    targetAudience: product.targetAudience,
    averagePrice: product.averagePrice,
  };
}

function personData(person: CompanyPersonSettings, companyId: string) {
  return {
    companyId,
    email: person.email,
    role: person.role,
    reportsToEmail: person.reportsToEmail,
  };
}

export async function replaceCompanySettings(companyId: string, input: UpdateCompanySettingsInput) {
  const companyExists = await prisma.company.findUnique({
    where: {
      id: companyId,
    },
    select: {
      id: true,
    },
  });

  if (!companyExists) {
    return null;
  }

  await prisma.$transaction(async (transaction) => {
    await transaction.company.update({
      where: {
        id: companyId,
      },
      data: {
        name: input.company.name,
        about: input.company.about,
        objectives: input.company.objectives,
        culture: input.company.culture,
      },
    });

    await transaction.companyProduct.deleteMany({
      where: {
        companyId,
      },
    });

    if (input.products.length > 0) {
      await transaction.companyProduct.createMany({
        data: input.products.map((product) => ({
          companyId,
          ...productData(product),
        })),
      });
    }

    await transaction.companyTeam.deleteMany({
      where: {
        companyId,
      },
    });

    for (const team of input.teams) {
      const createdTeam = await transaction.companyTeam.create({
        data: {
          companyId,
          name: team.name,
          about: team.about,
        },
      });

      if (team.people.length > 0) {
        await transaction.companyPerson.createMany({
          data: team.people.map((person) => ({
            ...personData(person, companyId),
            teamId: createdTeam.id,
          })),
        });
      }

      for (const group of team.groups) {
        const createdGroup = await transaction.companyGroup.create({
          data: {
            teamId: createdTeam.id,
            name: group.name,
            about: group.about,
          },
        });

        if (group.people.length > 0) {
          await transaction.companyPerson.createMany({
            data: group.people.map((person) => ({
              ...personData(person, companyId),
              teamId: createdTeam.id,
              groupId: createdGroup.id,
            })),
          });
        }
      }
    }
  });

  return findCompanySettings(companyId);
}
