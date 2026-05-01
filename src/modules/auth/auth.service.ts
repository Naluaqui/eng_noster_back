import { OAuth2Client } from 'google-auth-library';
import { env } from '../../config/env';
import { createAccessToken } from '../../infra/auth/token.service';
import { AppError } from '../../shared/errors/AppError';
import { createUser, findUserByEmail } from './auth.repository';
import type { AuthSession, GoogleAuthCodeInput, GoogleAuthInput } from './auth.types';

const googleClient = new OAuth2Client(env.googleClientId);

type GoogleProfile = {
  sub?: string;
  email?: string;
  name?: string;
  picture?: string;
};

async function createSessionFromGoogleProfile(profile: GoogleProfile): Promise<AuthSession> {
  if (!profile.email) {
    throw new AppError('Não foi possível validar o e-mail do Google.', 401);
  }

  let user = await findUserByEmail(profile.email);

  if (!user) {
    user = await createUser({
      name: profile.name ?? profile.email,
      email: profile.email,
      avatarUrl: profile.picture,
      googleId: profile.sub,
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

async function verifyGoogleCredential(credential: string) {
  if (!env.googleClientId) {
    throw new AppError('GOOGLE_CLIENT_ID não configurado.', 500);
  }

  if (!credential) {
    throw new AppError('Credential do Google não informado.', 400);
  }

  let ticket;

  try {
    ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: env.googleClientId,
    });
  } catch {
    throw new AppError('Credential do Google inválido.', 401);
  }

  return ticket.getPayload();
}

export async function signInWithGoogle(input: GoogleAuthInput): Promise<AuthSession> {
  const payload = await verifyGoogleCredential(input.credential);

  return createSessionFromGoogleProfile({
    sub: payload?.sub,
    email: payload?.email,
    name: payload?.name,
    picture: payload?.picture,
  });
}

export async function signInWithGoogleCode(input: GoogleAuthCodeInput): Promise<AuthSession> {
  if (!env.googleClientId || !env.googleClientSecret) {
    throw new AppError('Credenciais do Google não configuradas.', 500);
  }

  if (!input.code) {
    throw new AppError('Código do Google não informado.', 400);
  }

  const redirectUri = input.redirectUri ?? env.googleRedirectUri;
  const oauthClient = new OAuth2Client(
    env.googleClientId,
    env.googleClientSecret,
    redirectUri,
  );

  try {
    const { tokens } = await oauthClient.getToken({
      code: input.code,
      redirect_uri: redirectUri,
    });

    if (!tokens.id_token) {
      throw new AppError('ID token do Google não retornado.', 401);
    }

    const payload = await verifyGoogleCredential(tokens.id_token);

    return createSessionFromGoogleProfile({
      sub: payload?.sub,
      email: payload?.email,
      name: payload?.name,
      picture: payload?.picture,
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError('Código do Google inválido ou expirado.', 401);
  }
}
