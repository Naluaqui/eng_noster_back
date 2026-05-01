import { AppError } from '../../shared/errors/AppError';
import {
  createCompany,
  deleteCompany,
  findCompanies,
  findCompanyById,
  findCompanySettings,
  replaceCompanySettings,
} from './settings.repository';
import type {
  CompanyGroupSettings,
  CompanyPersonSettings,
  CompanyProductSettings,
  CompanyTeamSettings,
  CreateCompanyInput,
  UpdateCompanySettingsInput,
} from './settings.types';

function normalizeText(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeOptionalText(value: unknown) {
  const normalized = normalizeText(value);

  return normalized || undefined;
}

function assertRequired(value: string, field: string) {
  if (!value) {
    throw new AppError(`${field} e obrigatorio.`, 400);
  }
}

function assertMax(value: string | undefined, maxLength: number, field: string) {
  if (value && value.length > maxLength) {
    throw new AppError(`${field} deve ter ate ${maxLength} caracteres.`, 400);
  }
}

function assertEmail(value: string) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    throw new AppError('Email invalido.', 400);
  }
}

function normalizePerson(person: CompanyPersonSettings): CompanyPersonSettings {
  const email = normalizeText(person.email).toLowerCase();
  const role = normalizeOptionalText(person.role);
  const reportsToEmail = normalizeOptionalText(person.reportsToEmail)?.toLowerCase();

  assertRequired(email, 'Email da pessoa');
  assertEmail(email);
  assertMax(role, 120, 'Cargo');

  if (reportsToEmail) {
    assertEmail(reportsToEmail);
  }

  return {
    email,
    role,
    reportsToEmail,
  };
}

function normalizeGroup(group: CompanyGroupSettings): CompanyGroupSettings {
  const name = normalizeText(group.name);
  const about = normalizeOptionalText(group.about);
  const people = Array.isArray(group.people) ? group.people.map(normalizePerson) : [];

  assertRequired(name, 'Nome do grupo');
  assertMax(name, 120, 'Nome do grupo');
  assertMax(about, 1000, 'Sobre do grupo');

  return {
    name,
    about,
    people,
  };
}

function normalizeTeam(team: CompanyTeamSettings): CompanyTeamSettings {
  const name = normalizeText(team.name);
  const about = normalizeOptionalText(team.about);
  const people = Array.isArray(team.people) ? team.people.map(normalizePerson) : [];
  const groups = Array.isArray(team.groups) ? team.groups.map(normalizeGroup) : [];

  assertRequired(name, 'Nome do time');
  assertMax(name, 120, 'Nome do time');
  assertMax(about, 1000, 'Sobre do time');

  return {
    name,
    about,
    people,
    groups,
  };
}

function normalizeProduct(product: CompanyProductSettings): CompanyProductSettings {
  const name = normalizeText(product.name);
  const about = normalizeText(product.about);
  const solutionObjective = normalizeText(product.solutionObjective);
  const technology = normalizeText(product.technology);
  const targetAudience = normalizeText(product.targetAudience);
  const averagePrice = normalizeText(product.averagePrice);

  assertRequired(name, 'Nome do produto');
  assertRequired(about, 'Sobre do produto');
  assertRequired(solutionObjective, 'Objetivo da solucao');
  assertRequired(technology, 'Tecnologia');
  assertRequired(targetAudience, 'Publico alvo');
  assertRequired(averagePrice, 'Media de preco');
  assertMax(name, 120, 'Nome do produto');
  assertMax(about, 1000, 'Sobre do produto');
  assertMax(solutionObjective, 1000, 'Objetivo da solucao');
  assertMax(technology, 500, 'Tecnologia');
  assertMax(targetAudience, 500, 'Publico alvo');
  assertMax(averagePrice, 120, 'Media de preco');

  return {
    name,
    about,
    solutionObjective,
    technology,
    targetAudience,
    averagePrice,
  };
}

function normalizeSettings(input: UpdateCompanySettingsInput): UpdateCompanySettingsInput {
  const company = {
    name: normalizeText(input.company?.name),
    about: normalizeText(input.company?.about),
    objectives: normalizeText(input.company?.objectives),
    culture: normalizeText(input.company?.culture),
  };

  assertRequired(company.name, 'Nome da empresa');
  assertRequired(company.about, 'Sobre da empresa');
  assertRequired(company.objectives, 'Objetivos da empresa');
  assertRequired(company.culture, 'Cultura da empresa');
  assertMax(company.name, 120, 'Nome da empresa');
  assertMax(company.about, 1000, 'Sobre da empresa');
  assertMax(company.objectives, 1000, 'Objetivos da empresa');
  assertMax(company.culture, 1000, 'Cultura da empresa');

  return {
    company,
    products: Array.isArray(input.products) ? input.products.map(normalizeProduct) : [],
    teams: Array.isArray(input.teams) ? input.teams.map(normalizeTeam) : [],
  };
}

export async function getCompanySettings() {
  const companies = await findCompanies();
  const firstCompany = companies[0];

  if (!firstCompany) {
    throw new AppError('Nenhuma empresa cadastrada.', 404);
  }

  return getCompanySettingsById(firstCompany.id);
}

export async function listCompanies() {
  return findCompanies();
}

export async function createCompanyWorkspace(input: CreateCompanyInput) {
  const name = normalizeText(input.name);

  assertRequired(name, 'Nome da empresa');
  assertMax(name, 120, 'Nome da empresa');

  return createCompany(name);
}

export async function deleteCompanyWorkspace(companyId: string) {
  if (!companyId) {
    throw new AppError('Empresa nao informada.', 400);
  }

  const companies = await findCompanies();

  if (companies.length <= 1) {
    throw new AppError('Nao e possivel excluir o ultimo workspace.', 400);
  }

  const company = await findCompanyById(companyId);

  if (!company) {
    throw new AppError('Empresa nao encontrada.', 404);
  }

  return deleteCompany(companyId);
}

export async function getCompanySettingsById(companyId: string) {
  if (!companyId) {
    throw new AppError('Empresa nao informada.', 400);
  }

  const settings = await findCompanySettings(companyId);

  if (!settings) {
    throw new AppError('Configuracoes da empresa nao encontradas.', 404);
  }

  return settings;
}

export async function updateCompanySettings(companyId: string, input: UpdateCompanySettingsInput) {
  if (!companyId) {
    throw new AppError('Empresa nao informada.', 400);
  }

  const normalizedSettings = normalizeSettings(input);
  const settings = await replaceCompanySettings(companyId, normalizedSettings);

  if (!settings) {
    throw new AppError('Configuracoes da empresa nao encontradas.', 404);
  }

  return settings;
}
