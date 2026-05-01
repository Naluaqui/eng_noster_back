import type { CreateMeetingInput, Meeting, MeetingStatus } from './meetings.types';

const meetings: Meeting[] = [
  {
    id: 'kickoff-noster',
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
    id: 'priorizacao-roadmap',
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
    id: 'go-no-go',
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
    id: 'analise-objecoes',
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

function slugifyTitle(title: string) {
  const slug = title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);

  return slug || 'reuniao';
}

function copyMeeting(meeting: Meeting): Meeting {
  return {
    ...meeting,
    participants: [...meeting.participants],
    tags: [...meeting.tags],
  };
}

export async function findMeetings() {
  return meetings.map(copyMeeting);
}

export async function findMeetingById(meetingId: string) {
  const meeting = meetings.find((item) => item.id === meetingId);

  return meeting ? copyMeeting(meeting) : null;
}

export async function updateMeetingStatus(meetingId: string, status: MeetingStatus) {
  const meeting = meetings.find((item) => item.id === meetingId);

  if (!meeting) {
    return null;
  }

  meeting.status = status;

  return copyMeeting(meeting);
}

export async function createMeeting(input: CreateMeetingInput) {
  const idBase = slugifyTitle(input.title);
  const id = `${idBase}-${crypto.randomUUID().slice(0, 8)}`;
  const participants = input.participants ?? [];
  const product = input.product?.trim();
  const description = input.description?.trim();
  const notes = input.notes?.trim();
  const tags = product ? [product] : [];

  const meeting: Meeting = {
    id,
    title: input.title.trim(),
    date: input.date,
    time: input.time,
    participants,
    status: 'scheduled',
    summary: description || notes || 'Reuniao criada para analise no NOSTER.',
    owner: participants[0] ?? 'NOSTER',
    tags,
    signalCount: 0,
    product: product || undefined,
    description: description || undefined,
    notes: notes || undefined,
  };

  meetings.unshift(meeting);

  return copyMeeting(meeting);
}
