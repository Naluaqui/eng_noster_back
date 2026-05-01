import type { Request, Response } from 'express';
import { successResponse } from '../../shared/http/response';
import { signInWithGoogle } from './auth.service';

export async function googleSignInController(request: Request, response: Response) {
  const session = await signInWithGoogle(request.body);

  return response.status(200).json(successResponse(session, 'Login realizado com sucesso.'));
}
