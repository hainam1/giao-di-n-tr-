import { errorResponse } from './responseHandler.js';

export class AppError extends Error {
  constructor(message, statusCode = 400, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (err, req, res, _next) => {
  console.error('[Error Logger]:', err);

  if (err instanceof AppError) {
    return errorResponse(res, {
      statusCode: err.statusCode,
      message: err.message,
      error: err.details || err.message,
    });
  }

  // Phản hồi mặc định cho lỗi chưa lường trước
  return errorResponse(res, {
    statusCode: err.statusCode || 500,
    message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    error: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};
