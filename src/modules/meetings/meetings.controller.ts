import type { Request, Response } from 'express';
import { successResponse } from '../../shared/http/response';
import {
  changeMeetingStatus,
  getMeeting,
  listMeetings,
  scheduleMeeting,
} from './meetings.service';

export async function listMeetingsController(_request: Request, response: Response) {
  const meetings = await listMeetings();

  return response
    .status(200)
    .json(successResponse(meetings, 'Reunioes carregadas com sucesso.'));
}

export async function getMeetingController(request: Request, response: Response) {
  const meeting = await getMeeting(String(request.params.meetingId));

  return response
    .status(200)
    .json(successResponse(meeting, 'Reuniao carregada com sucesso.'));
}

export async function updateMeetingStatusController(request: Request, response: Response) {
  const meeting = await changeMeetingStatus(String(request.params.meetingId), request.body);

  return response
    .status(200)
    .json(successResponse(meeting, 'Status da reuniao atualizado com sucesso.'));
}

export async function createMeetingController(request: Request, response: Response) {
  const meeting = await scheduleMeeting(request.body);

  return response
    .status(201)
    .json(successResponse(meeting, 'Reuniao criada com sucesso.'));
}
