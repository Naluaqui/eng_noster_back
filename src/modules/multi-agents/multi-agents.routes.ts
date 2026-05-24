import { Router } from 'express';
import { analyzeMeetingsController } from './multi-agents.controller';

export const multiAgentsRoutes = Router();

multiAgentsRoutes.post('/analyze', analyzeMeetingsController);
