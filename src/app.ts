import cors from 'cors';
import express from 'express';
import { routes } from './routes';
import { errorHandler } from './shared/errors/error-handler';

export const app = express();

app.use(cors());
app.use(express.json());

const REQUIRED_ENV_VARS = [
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_REDIRECT_URI',
  'AI_API_URL',
];

app.get('/health', (_request, response) => {
  const missingEnvVars = REQUIRED_ENV_VARS.filter((name) => !process.env[name]);
  const envs = Object.fromEntries(
    REQUIRED_ENV_VARS.map((name) => [name, process.env[name] ? 'ok' : `${name} NAO ACHADO`]),
  );

  return response.status(missingEnvVars.length === 0 ? 200 : 500).json({
    status: missingEnvVars.length === 0 ? 'ok' : 'erro',
    service: 'eng-decision-back',
    envs,
  });
});

app.use('/api', routes);

app.use(errorHandler);
