import jwt from 'jsonwebtoken';
import { config } from '../config/app.config.js';
import { AppError } from './errorHandler.js';
import prisma from '../database/prismaClient.js';

export const authenticateJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Unauthorized: Token missing', 401));
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    if (decoded.type && decoded.type !== 'access') {
      return next(new AppError('Unauthorized: Invalid token type', 401));
    }
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, name: true, role: true, status: true },
    });
    if (!user) return next(new AppError('Unauthorized: User not found', 401));
    if (user.status !== 'ACTIVE') return next(new AppError('Forbidden: User account is blocked', 403));
    req.user = user;
    return next();
  } catch (err) {
    if (err instanceof AppError) return next(err);
    return next(new AppError('Unauthorized: Invalid or expired token', 401));
  }
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Forbidden: Insufficient permissions', 403));
    }
    next();
  };
};
