import { Router } from 'express';
import {
  createMeetingController,
  deleteMeetingController,
  getMeetingController,
  listMeetingsController,
  updateMeetingController,
  updateMeetingStatusController,
} from './meetings.controller';

export const meetingsRoutes = Router();

meetingsRoutes.get('/', listMeetingsController);
meetingsRoutes.post('/', createMeetingController);
meetingsRoutes.get('/:meetingId', getMeetingController);
meetingsRoutes.put('/:meetingId', updateMeetingController);
meetingsRoutes.delete('/:meetingId', deleteMeetingController);
meetingsRoutes.patch('/:meetingId/status', updateMeetingStatusController);
