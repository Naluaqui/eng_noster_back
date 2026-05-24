import { AppError } from '../../shared/errors/AppError';
import type { AnalyzeMeetingsInput } from './multi-agents.types';

export function parseAnalyzeMeetingsInput(value: unknown): AnalyzeMeetingsInput {
  if (!value || typeof value !== 'object') {
    throw new AppError('Informe as reunioes que devem ser analisadas.', 400);
  }

  const input = value as Record<string, unknown>;

  if (!Array.isArray(input.meetingIds) || input.meetingIds.length === 0) {
    throw new AppError('meetingIds deve conter ao menos uma reuniao.', 400);
  }

  if (input.meetingIds.some((meetingId) => typeof meetingId !== 'string' || !meetingId.trim())) {
    throw new AppError('meetingIds contem um identificador invalido.', 400);
  }

  if (input.question !== undefined && typeof input.question !== 'string') {
    throw new AppError('question deve ser um texto.', 400);
  }

  const meetingIds = Array.from(new Set((input.meetingIds as string[]).map((meetingId) => meetingId.trim())));
  const question = typeof input.question === 'string' ? input.question.trim() : '';

  return {
    meetingIds,
    ...(question ? { question } : {}),
  };
}
