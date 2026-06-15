import { prisma } from '../../infra/database/prisma.client';
import { totvsProductsAndServicesCatalog } from '../settings/totvs-catalog';
import type { AuthUser } from './auth.types';

type CreateAuthUserInput = Omit<AuthUser, 'id'> & {
  googleId?: string;
};

const onboardingCompany = {
  about:
    'A TOTVS é a maior empresa de tecnologia do Brasil, oferecendo ERPs, soluções de gestão, RH, CRM, automação comercial e tecnologia financeira para empresas de todos os portes e segmentos.',
  objectives:
    'Ajudar empresas a digitalizar e otimizar processos de gestão, vendas, RH e operações por meio de um ecossistema completo de produtos e serviços integrados.',
  culture:
    'Cultura orientada a resultados, inovação contínua e proximidade com o cliente, com forte presença em todo o território nacional.',
};

const onboardingMeetingTranscription = `Dados da reuniao: ID 1000002 | Data: 06/03/2025 | Tipo: VIDEO | Duracao: 01:37:38 | Status: IN_PROGRESS | Codigo: T64874 | Categoria: OPERACIONAL | Cadastrada em: 27/02/2025

[LOCUTOR 1]: Qual é o preço?
[LOCUTOR 2]: Trabalhamos com pacotes customizados. Uns 15 a 20 mil por mês.
[LOCUTOR 1]: E se não der certo?
[LOCUTOR 2]: A gente oferece 60 dias de trial gratuito.
[LOCUTOR 1]: Se após 60 dias vocês não veem resultado, não cobramos nada.
[LOCUTOR 2]: Isso muda bastante a conversa.
[LOCUTOR 1]: Temos confiança no que fazemos.`;

function mapUserToAuthUser(user: {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl ?? undefined,
  };
}

export async function findUserByEmail(email: string) {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  return user ? mapUserToAuthUser(user) : null;
}

export async function createUser(user: CreateAuthUserInput) {
  const createdUser = await prisma.user.create({
    data: {
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      googleId: user.googleId,
      memberships: {
        create: {
          role: 'owner',
          company: {
            create: {
              name: 'TOTVS',
              about: onboardingCompany.about,
              objectives: onboardingCompany.objectives,
              culture: onboardingCompany.culture,
              products: {
                createMany: {
                  data: totvsProductsAndServicesCatalog.map((product) => ({
                    name: product.name,
                    about: product.about,
                    solutionObjective: product.solutionObjective,
                    technology: product.technology,
                    targetAudience: product.targetAudience,
                    averagePrice: product.averagePrice,
                  })),
                },
              },
            },
          },
        },
      },
    },
    include: {
      memberships: {
        take: 1,
        select: {
          companyId: true,
        },
      },
    },
  });

  const companyId = createdUser.memberships[0]?.companyId;

  if (companyId) {
    await prisma.meeting.create({
      data: {
        title: 'Reunião Comercial - Proposta de Pacote TOTVS e Garantia de Trial',
        date: new Date('2025-03-06T00:00:00.000Z'),
        time: '10:00',
        participants: ['Comercial TOTVS', 'Cliente Prospect'],
        status: 'in_review',
        summary:
          'Reuniao comercial sobre precificacao de pacotes customizados (R$ 15 a 20 mil por mes) e oferta de 60 dias de trial gratuito com garantia de resultado.',
        owner: 'Comercial TOTVS',
        tags: ['comercial', 'precificacao', 'trial'],
        signalCount: 3,
        product: 'TOTVS Backoffice - Linha Protheus',
        description:
          'Conversa comercial discutindo valores de pacotes customizados e a garantia de 60 dias de trial gratuito sem cobranca em caso de insatisfacao.',
        transcription: onboardingMeetingTranscription,
        companyId,
        createdBy: createdUser.id,
      },
    });
  }

  return mapUserToAuthUser(createdUser);
}
