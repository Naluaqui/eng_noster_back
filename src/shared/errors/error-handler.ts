import type { ErrorRequestHandler } from 'express';
import { AppError } from './AppError';

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof AppError) {
    return response.status(error.statusCode).json({
      success: false,
      message: error.message,
      details: error.details,
    });
  }

  console.error(error);

  return response.status(500).json({
    success: false,
    message: 'Erro interno do servidor.',
  });
};
