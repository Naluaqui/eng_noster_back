import type { Request, Response } from 'express';
import { successResponse } from '../../shared/http/response';
import {
  changeMeetingStatus,
  editMeeting,
  getMeeting,
  listMeetings,
  removeMeeting,
  scheduleMeeting,
} from './meetings.service';

function getCompanyId(request: Request) {
  const headerCompanyId = request.header('x-company-id');
  const queryCompanyId = request.query.companyId;

  if (typeof queryCompanyId === 'string') {
    return queryCompanyId;
  }

  return headerCompanyId;
}

export async function listMeetingsController(request: Request, response: Response) {
  const meetings = await listMeetings(getCompanyId(request));

  return response
    .status(200)
    .json(successResponse(meetings, 'Reunioes carregadas com sucesso.'));
}

export async function getMeetingController(request: Request, response: Response) {
  const meeting = await getMeeting(String(request.params.meetingId), getCompanyId(request));

  return response
    .status(200)
    .json(successResponse(meeting, 'Reuniao carregada com sucesso.'));
}

export async function updateMeetingStatusController(request: Request, response: Response) {
  const meeting = await changeMeetingStatus(
    String(request.params.meetingId),
    getCompanyId(request),
    request.body,
  );

  return response
    .status(200)
    .json(successResponse(meeting, 'Status da reuniao atualizado com sucesso.'));
}

export async function createMeetingController(request: Request, response: Response) {
  const meeting = await scheduleMeeting(getCompanyId(request), request.body);

  return response
    .status(201)
    .json(successResponse(meeting, 'Reuniao criada com sucesso.'));
}

export async function updateMeetingController(request: Request, response: Response) {
  const meeting = await editMeeting(String(request.params.meetingId), getCompanyId(request), request.body);

  return response
    .status(200)
    .json(successResponse(meeting, 'Reuniao atualizada com sucesso.'));
}

export async function deleteMeetingController(request: Request, response: Response) {
  const meeting = await removeMeeting(String(request.params.meetingId), getCompanyId(request));

  return response
    .status(200)
    .json(successResponse(meeting, 'Reuniao excluida com sucesso.'));
}
