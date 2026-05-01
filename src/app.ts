import cors from 'cors';
import express from 'express';
import { routes } from './routes';
import { errorHandler } from './shared/errors/error-handler';

export const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_request, response) => {
  return response.status(200).json({
    status: 'ok',
    service: 'eng-decision-back',
  });
});

app.use('/api', routes);

app.use(errorHandler);
