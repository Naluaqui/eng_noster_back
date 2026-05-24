import { prisma } from '../../infra/database/prisma.client';
import type { MeetingStatus as DatabaseMeetingStatus } from '../../generated/prisma/enums';
import type { CreateMeetingInput, Meeting, MeetingStatus, UpdateMeetingInput } from './meetings.types';

type DatabaseMeeting = {
  id: string;
  title: string;
  date: Date;
  time: string;
  participants: string[];
  status: DatabaseMeetingStatus;
  summary: string;
  owner: string;
  tags: string[];
  signalCount: number;
  product: string | null;
  description: string | null;
  transcription: string | null;
  notes: string | null;
};

const defaultMeetings: Array<Omit<Meeting, 'id'>> = [
  {
    title: 'Kickoff Noster',
    date: '2026-04-28',
    time: '09:00',
    participants: ['Produto', 'Comercial', 'Financeiro'],
    status: 'scheduled',
    summary: 'Alinhar escopo de IA multi-perspectiva e rituais de decisao do produto.',
    owner: 'Ana Lu',
    tags: ['roadmap', 'produto'],
    signalCount: 6,
    product: 'NOSTER',
    description: 'Alinhar escopo de IA multi-perspectiva e rituais de decisao do produto.',
    transcription: 'Alinhar escopo de IA multi-perspectiva e rituais de decisao do produto.',
  },
  {
    title: 'Priorizacao de roadmap',
    date: '2026-05-02',
    time: '14:00',
    participants: ['Produto', 'Cliente', 'Marketing'],
    status: 'in-review',
    summary: 'Comparar impacto, esforco e percepcao de valor das proximas entregas.',
    owner: 'Time Produto',
    tags: ['risco', 'cliente'],
    signalCount: 11,
    product: 'Roadmap',
    description: 'Comparar impacto, esforco e percepcao de valor das proximas entregas.',
    transcription: 'Comparar impacto, esforco e percepcao de valor das proximas entregas.',
  },
  {
    title: 'Go / no-go comercial',
    date: '2026-05-08',
    time: '11:00',
    participants: ['Vendas', 'Diretoria', 'Operacoes'],
    status: 'decided',
    summary: 'Registrar decisao comercial e criterios para avancar com implantacao.',
    owner: 'Diretoria',
    tags: ['financeiro', 'decisao'],
    signalCount: 8,
    product: 'Implantacao',
    description: 'Registrar decisao comercial e criterios para avancar com implantacao.',
    transcription: 'Registrar decisao comercial e criterios para avancar com implantacao.',
  },
  {
    title: 'Analise de objecoes',
    date: '2026-05-12',
    time: '16:30',
    participants: ['Vendas', 'Cliente', 'Suporte'],
    status: 'in-review',
    summary: 'Transformar duvidas recorrentes em narrativa de valor e proximos passos.',
    owner: 'Comercial',
    tags: ['objecoes', 'conversao'],
    signalCount: 14,
    product: 'Comercial',
    description: 'Transformar duvidas recorrentes em narrativa de valor e proximos passos.',
    transcription: 'Transformar duvidas recorrentes em narrativa de valor e proximos passos.',
  },
];

const defaultMeetingSummary = 'Reuniao criada para analise no NOSTER.';
const maximumSummaryLength = 500;

function toDatabaseDate(date: string) {
  return new Date(`${date}T00:00:00.000Z`);
}

function toApiDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function toDatabaseStatus(status: MeetingStatus): DatabaseMeetingStatus {
  return status === 'in-review' ? 'in_review' : status;
}

function toApiStatus(status: DatabaseMeetingStatus): MeetingStatus {
  return status === 'in_review' ? 'in-review' : status;
}

function createSummary(description?: string) {
  return (description || defaultMeetingSummary).slice(0, maximumSummaryLength);
}

function mapMeetingToApi(meeting: DatabaseMeeting): Meeting {
  return {
    id: meeting.id,
    title: meeting.title,
    date: toApiDate(meeting.date),
    time: meeting.time,
    participants: meeting.participants,
    status: toApiStatus(meeting.status),
    summary: meeting.summary,
    owner: meeting.owner,
    tags: meeting.tags,
    signalCount: meeting.signalCount,
    product: meeting.product ?? undefined,
    description: meeting.description ?? undefined,
    transcription: meeting.transcription ?? undefined,
    notes: meeting.notes ?? undefined,
  };
}

async function ensureDefaultWorkspace() {
  const user = await prisma.user.upsert({
    where: {
      email: 'system@noster.local',
    },
    update: {},
    create: {
      name: 'NOSTER',
      email: 'system@noster.local',
      memberships: {
        create: {
          role: 'owner',
          company: {
            create: {
              name: 'NOSTER Workspace',
            },
          },
        },
      },
    },
    include: {
      memberships: {
        take: 1,
      },
    },
  });

  const existingMembership = user.memberships[0];

  if (existingMembership) {
    return {
      userId: user.id,
      companyId: existingMembership.companyId,
    };
  }

  const company = await prisma.company.create({
    data: {
      name: 'NOSTER Workspace',
      members: {
        create: {
          role: 'owner',
          userId: user.id,
        },
      },
    },
  });

  return {
    userId: user.id,
    companyId: company.id,
  };
}

async function resolveCompanyId(companyId?: string) {
  if (companyId) {
    const company = await prisma.company.findUnique({
      where: {
        id: companyId,
      },
      select: {
        id: true,
      },
    });

    return company?.id ?? null;
  }

  const workspace = await ensureDefaultWorkspace();

  return workspace.companyId;
}

async function ensureDefaultMeetings() {
  const meetingsCount = await prisma.meeting.count();

  if (meetingsCount > 0) {
    return;
  }

  const workspace = await ensureDefaultWorkspace();

  await prisma.meeting.createMany({
    data: defaultMeetings.map((meeting) => ({
      title: meeting.title,
      date: toDatabaseDate(meeting.date),
      time: meeting.time,
      participants: meeting.participants,
      status: toDatabaseStatus(meeting.status),
      summary: meeting.summary,
      owner: meeting.owner,
      tags: meeting.tags,
      signalCount: meeting.signalCount,
      product: meeting.product,
      description: meeting.description,
      transcription: meeting.transcription,
      notes: meeting.notes,
      companyId: workspace.companyId,
      createdBy: workspace.userId,
    })),
  });
}

export async function findMeetings(companyId?: string) {
  const resolvedCompanyId = await resolveCompanyId(companyId);

  if (!resolvedCompanyId) {
    return [];
  }

  const meetings = await prisma.meeting.findMany({
    where: {
      companyId: resolvedCompanyId,
    },
    orderBy: [
      {
        createdAt: 'desc',
      },
    ],
  });

  return meetings.map(mapMeetingToApi);
}

export async function findMeetingById(meetingId: string, companyId?: string) {
  const resolvedCompanyId = await resolveCompanyId(companyId);

  if (!resolvedCompanyId) {
    return null;
  }

  const meeting = await prisma.meeting.findFirst({
    where: {
      id: meetingId,
      companyId: resolvedCompanyId,
    },
  });

  return meeting ? mapMeetingToApi(meeting) : null;
}

export async function updateMeetingStatus(meetingId: string, companyId: string | undefined, status: MeetingStatus) {
  const meeting = await findMeetingRecord(meetingId, companyId);

  if (!meeting) {
    return null;
  }

  const updatedMeeting = await prisma.meeting
    .update({
      where: {
        id: meetingId,
      },
      data: {
        status: toDatabaseStatus(status),
      },
    })
    .catch(() => null);

  return updatedMeeting ? mapMeetingToApi(updatedMeeting) : null;
}

async function findMeetingRecord(meetingId: string, companyId?: string) {
  const resolvedCompanyId = await resolveCompanyId(companyId);

  if (!resolvedCompanyId) {
    return null;
  }

  return prisma.meeting.findFirst({
    where: {
      id: meetingId,
      companyId: resolvedCompanyId,
    },
  });
}

export async function createMeeting(companyId: string | undefined, input: CreateMeetingInput) {
  const workspace = await ensureDefaultWorkspace();
  const resolvedCompanyId = await resolveCompanyId(companyId);

  if (!resolvedCompanyId) {
    return null;
  }

  const participants = input.participants ?? [];
  const product = input.product?.trim();
  const description = input.description?.trim();
  const transcription = input.transcription?.trim();
  const notes = input.notes?.trim();

  const meeting = await prisma.meeting.create({
    data: {
      title: input.title.trim(),
      date: toDatabaseDate(input.date),
      time: input.time,
      participants,
      status: 'scheduled',
      summary: createSummary(description),
      owner: participants[0] ?? 'NOSTER',
      tags: product ? [product] : [],
      signalCount: 0,
      product: product || undefined,
      description: description || undefined,
      transcription: transcription || undefined,
      notes: notes || undefined,
      companyId: resolvedCompanyId,
      createdBy: workspace.userId,
    },
  });

  return mapMeetingToApi(meeting);
}

export async function updateMeeting(meetingId: string, companyId: string | undefined, input: UpdateMeetingInput) {
  const existingMeeting = await findMeetingRecord(meetingId, companyId);

  if (!existingMeeting) {
    return null;
  }

  const participants = input.participants ?? [];
  const product = input.product?.trim();
  const description = input.description?.trim();
  const transcription = input.transcription?.trim();
  const notes = input.notes?.trim();

  const meeting = await prisma.meeting
    .update({
      where: {
        id: meetingId,
      },
      data: {
        title: input.title.trim(),
        date: toDatabaseDate(input.date),
        time: input.time,
        participants,
        summary: createSummary(description),
        owner: participants[0] ?? 'NOSTER',
        tags: product ? [product] : [],
        product: product || null,
        description: description || null,
        transcription: transcription || null,
        notes: notes || null,
      },
    })
    .catch(() => null);

  return meeting ? mapMeetingToApi(meeting) : null;
}

export async function markMeetingsAnalyzed(
  meetingIds: string[],
  companyId: string | undefined,
  executiveSummary: string,
) {
  const resolvedCompanyId = await resolveCompanyId(companyId);

  if (!resolvedCompanyId) {
    return;
  }

  await prisma.meeting.updateMany({
    where: {
      id: { in: meetingIds },
      companyId: resolvedCompanyId,
    },
    data: {
      status: 'analyzed',
    },
  });

  const fallbackDescription = executiveSummary.trim().slice(0, maximumSummaryLength);

  if (!fallbackDescription) {
    return;
  }

  await prisma.meeting.updateMany({
    where: {
      id: { in: meetingIds },
      companyId: resolvedCompanyId,
      OR: [{ description: null }, { description: '' }],
    },
    data: {
      description: fallbackDescription,
      summary: fallbackDescription,
    },
  });
}

export async function deleteMeeting(meetingId: string, companyId?: string) {
  const existingMeeting = await findMeetingRecord(meetingId, companyId);

  if (!existingMeeting) {
    return null;
  }

  await prisma.meeting.delete({
    where: {
      id: meetingId,
    },
  });

  return mapMeetingToApi(existingMeeting);
}
