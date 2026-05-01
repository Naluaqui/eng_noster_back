import { Router } from 'express';
import { googleCodeSignInController, googleSignInController } from './auth.controller';

export const authRoutes = Router();

authRoutes.post('/google', googleSignInController);
authRoutes.post('/google/code', googleCodeSignInController);
