import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../../config/env';

type TokenPayload = {
  sub: string;
  email: string;
};

export function createAccessToken(payload: TokenPayload) {
  const options: SignOptions = {
    expiresIn: env.jwtExpiresIn as SignOptions['expiresIn'],
  };

  return jwt.sign(payload, env.jwtSecret, {
    ...options,
  });
}
