import { AppError } from '../../shared/errors/AppError';
import {
  findMeetingById,
  findMeetings,
  updateMeetingStatus,
} from './meetings.repository';
import type { MeetingStatus, UpdateMeetingStatusInput } from './meetings.types';

const meetingStatuses: MeetingStatus[] = ['scheduled', 'in-review', 'decided'];

function isMeetingStatus(status: unknown): status is MeetingStatus {
  return typeof status === 'string' && meetingStatuses.includes(status as MeetingStatus);
}

export async function listMeetings() {
  return findMeetings();
}

export async function getMeeting(meetingId: string) {
  const meeting = await findMeetingById(meetingId);

  if (!meeting) {
    throw new AppError('Reuniao nao encontrada.', 404);
  }

  return meeting;
}

export async function changeMeetingStatus(meetingId: string, input: UpdateMeetingStatusInput) {
  if (!isMeetingStatus(input.status)) {
    throw new AppError('Status de reuniao invalido.', 400, {
      allowedStatuses: meetingStatuses,
    });
  }

  const meeting = await updateMeetingStatus(meetingId, input.status);

  if (!meeting) {
    throw new AppError('Reuniao nao encontrada.', 404);
  }

  return meeting;
}
