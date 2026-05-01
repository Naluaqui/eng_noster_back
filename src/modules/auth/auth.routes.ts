import { Router } from 'express';
import { googleSignInController } from './auth.controller';

export const authRoutes = Router();

authRoutes.post('/google', googleSignInController);
