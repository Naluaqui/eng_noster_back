import { AppError } from '../../shared/errors/AppError';
import {
  createMeeting,
  deleteMeeting,
  findMeetingById,
  findMeetings,
  updateMeeting,
  updateMeetingStatus,
} from './meetings.repository';
import type {
  CreateMeetingInput,
  MeetingStatus,
  UpdateMeetingInput,
  UpdateMeetingStatusInput,
} from './meetings.types';

const meetingStatuses: MeetingStatus[] = ['scheduled', 'in-review', 'decided', 'analyzed'];

function isMeetingStatus(status: unknown): status is MeetingStatus {
  return typeof status === 'string' && meetingStatuses.includes(status as MeetingStatus);
}

function isDateString(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function isTimeString(value: string) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function normalizeText(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeOptionalText(value: unknown) {
  const normalized = normalizeText(value);

  return normalized || undefined;
}

function normalizeParticipants(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 24);
}

export async function listMeetings(companyId?: string) {
  return findMeetings(companyId);
}

export async function getMeeting(meetingId: string, companyId?: string) {
  const meeting = await findMeetingById(meetingId, companyId);

  if (!meeting) {
    throw new AppError('Reuniao nao encontrada.', 404);
  }

  return meeting;
}

export async function changeMeetingStatus(meetingId: string, companyId: string | undefined, input: UpdateMeetingStatusInput) {
  if (!isMeetingStatus(input.status)) {
    throw new AppError('Status de reuniao invalido.', 400, {
      allowedStatuses: meetingStatuses,
    });
  }

  const meeting = await updateMeetingStatus(meetingId, companyId, input.status);

  if (!meeting) {
    throw new AppError('Reuniao nao encontrada.', 404);
  }

  return meeting;
}

export async function scheduleMeeting(companyId: string | undefined, input: CreateMeetingInput) {
  const normalizedInput = normalizeMeetingInput(input);
  const meeting = await createMeeting(companyId, normalizedInput);

  if (!meeting) {
    throw new AppError('Empresa nao encontrada.', 404);
  }

  return meeting;
}

function normalizeMeetingInput(input: CreateMeetingInput | UpdateMeetingInput) {
  const title = normalizeText(input.title);
  const date = normalizeText(input.date);
  const time = normalizeText(input.time);
  const product = normalizeOptionalText(input.product);
  const description = normalizeOptionalText(input.description);
  const transcription = normalizeOptionalText(input.transcription);
  const notes = normalizeOptionalText(input.notes);
  const participants = normalizeParticipants(input.participants);

  if (title.length < 3 || title.length > 120) {
    throw new AppError('Titulo deve ter entre 3 e 120 caracteres.', 400);
  }

  if (!isDateString(date)) {
    throw new AppError('Data da reuniao invalida.', 400);
  }

  if (!isTimeString(time)) {
    throw new AppError('Hora da reuniao invalida.', 400);
  }

  if (product && product.length > 80) {
    throw new AppError('Produto deve ter ate 80 caracteres.', 400);
  }

  if (description && description.length > 500) {
    throw new AppError('Descricao deve ter ate 500 caracteres.', 400);
  }

  if (notes && notes.length > 1000) {
    throw new AppError('Anotacoes devem ter ate 1000 caracteres.', 400);
  }

  if (participants.some((participant) => participant.length > 80)) {
    throw new AppError('Cada pessoa envolvida deve ter ate 80 caracteres.', 400);
  }

  return {
    title,
    date,
    time,
    participants,
    product,
    description,
    transcription,
    notes,
  };
}

export async function editMeeting(meetingId: string, companyId: string | undefined, input: UpdateMeetingInput) {
  const normalizedInput = normalizeMeetingInput(input);
  const meeting = await updateMeeting(meetingId, companyId, normalizedInput);

  if (!meeting) {
    throw new AppError('Reuniao nao encontrada.', 404);
  }

  return meeting;
}

export async function removeMeeting(meetingId: string, companyId?: string) {
  const meeting = await deleteMeeting(meetingId, companyId);

  if (!meeting) {
    throw new AppError('Reuniao nao encontrada.', 404);
  }

  return meeting;
}
