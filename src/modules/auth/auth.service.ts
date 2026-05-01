import { OAuth2Client } from 'google-auth-library';
import { env } from '../../config/env';
import { createAccessToken } from '../../infra/auth/token.service';
import { AppError } from '../../shared/errors/AppError';
import { createUser, findUserByEmail } from './auth.repository';
import type { AuthSession, GoogleAuthInput } from './auth.types';

const googleClient = new OAuth2Client(env.googleClientId);

export async function signInWithGoogle(input: GoogleAuthInput): Promise<AuthSession> {
  if (!env.googleClientId) {
    throw new AppError('GOOGLE_CLIENT_ID não configurado.', 500);
  }

  const ticket = await googleClient.verifyIdToken({
    idToken: input.credential,
    audience: env.googleClientId,
  });

  const payload = ticket.getPayload();

  if (!payload?.email) {
    throw new AppError('Não foi possível validar o e-mail do Google.', 401);
  }

  let user = await findUserByEmail(payload.email);

  if (!user) {
    user = await createUser({
      name: payload.name ?? payload.email,
      email: payload.email,
      avatarUrl: payload.picture,
    });
  }

  const accessToken = createAccessToken({
    sub: user.id,
    email: user.email,
  });

  return {
    user,
    accessToken,
  };
}
