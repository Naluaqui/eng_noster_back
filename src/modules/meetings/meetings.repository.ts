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
  },
];

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
      notes: meeting.notes,
      companyId: workspace.companyId,
      createdBy: workspace.userId,
    })),
  });
}

export async function findMeetings() {
  await ensureDefaultMeetings();

  const meetings = await prisma.meeting.findMany({
    orderBy: [
      {
        createdAt: 'desc',
      },
    ],
  });

  return meetings.map(mapMeetingToApi);
}

export async function findMeetingById(meetingId: string) {
  await ensureDefaultMeetings();

  const meeting = await prisma.meeting.findUnique({
    where: {
      id: meetingId,
    },
  });

  return meeting ? mapMeetingToApi(meeting) : null;
}

export async function updateMeetingStatus(meetingId: string, status: MeetingStatus) {
  const meeting = await prisma.meeting
    .update({
      where: {
        id: meetingId,
      },
      data: {
        status: toDatabaseStatus(status),
      },
    })
    .catch(() => null);

  return meeting ? mapMeetingToApi(meeting) : null;
}

export async function createMeeting(input: CreateMeetingInput) {
  const workspace = await ensureDefaultWorkspace();
  const participants = input.participants ?? [];
  const product = input.product?.trim();
  const description = input.description?.trim();
  const notes = input.notes?.trim();

  const meeting = await prisma.meeting.create({
    data: {
      title: input.title.trim(),
      date: toDatabaseDate(input.date),
      time: input.time,
      participants,
      status: 'scheduled',
      summary: description || notes || 'Reuniao criada para analise no NOSTER.',
      owner: participants[0] ?? 'NOSTER',
      tags: product ? [product] : [],
      signalCount: 0,
      product: product || undefined,
      description: description || undefined,
      notes: notes || undefined,
      companyId: workspace.companyId,
      createdBy: workspace.userId,
    },
  });

  return mapMeetingToApi(meeting);
}

export async function updateMeeting(meetingId: string, input: UpdateMeetingInput) {
  const participants = input.participants ?? [];
  const product = input.product?.trim();
  const description = input.description?.trim();
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
        summary: description || notes || 'Reuniao criada para analise no NOSTER.',
        owner: participants[0] ?? 'NOSTER',
        tags: product ? [product] : [],
        product: product || null,
        description: description || null,
        notes: notes || null,
      },
    })
    .catch(() => null);

  return meeting ? mapMeetingToApi(meeting) : null;
}
