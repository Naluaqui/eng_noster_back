import type { Meeting, MeetingStatus } from './meetings.types';

const meetings: Meeting[] = [
  {
    id: 'kickoff-noster',
    title: 'Kickoff Noster',
    date: '2026-04-28',
    participants: ['Produto', 'Comercial', 'Financeiro'],
    status: 'scheduled',
    summary: 'Alinhar escopo de IA multi-perspectiva e rituais de decisao do produto.',
    owner: 'Ana Lu',
    tags: ['roadmap', 'produto'],
    signalCount: 6,
  },
  {
    id: 'priorizacao-roadmap',
    title: 'Priorizacao de roadmap',
    date: '2026-05-02',
    participants: ['Produto', 'Cliente', 'Marketing'],
    status: 'in-review',
    summary: 'Comparar impacto, esforco e percepcao de valor das proximas entregas.',
    owner: 'Time Produto',
    tags: ['risco', 'cliente'],
    signalCount: 11,
  },
  {
    id: 'go-no-go',
    title: 'Go / no-go comercial',
    date: '2026-05-08',
    participants: ['Vendas', 'Diretoria', 'Operacoes'],
    status: 'decided',
    summary: 'Registrar decisao comercial e criterios para avancar com implantacao.',
    owner: 'Diretoria',
    tags: ['financeiro', 'decisao'],
    signalCount: 8,
  },
  {
    id: 'analise-objecoes',
    title: 'Analise de objecoes',
    date: '2026-05-12',
    participants: ['Vendas', 'Cliente', 'Suporte'],
    status: 'in-review',
    summary: 'Transformar duvidas recorrentes em narrativa de valor e proximos passos.',
    owner: 'Comercial',
    tags: ['objecoes', 'conversao'],
    signalCount: 14,
  },
];

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
