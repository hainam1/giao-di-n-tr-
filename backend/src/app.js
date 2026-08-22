import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config/app.config.js';
import { errorHandler, AppError } from './core/errorHandler.js';
import { successResponse } from './core/responseHandler.js';

// Import Routes Modules
import authRoutes from './modules/auth/auth.routes.js';
import sampleRoutes from './modules/sample/sample.routes.js';
import commerceRoutes from './modules/commerce/commerce.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';

const app = express();

// Security & Global Middlewares
app.use(helmet());
app.use(cors(config.cors));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiting
const limiter = rateLimit(config.rateLimit);
app.use('/api/', limiter);

// Health Check Endpoint
app.get('/health', (req, res) => {
  return successResponse(res, {
    message: 'Backend Service is Healthy and Running',
    data: {
      status: 'UP',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  });
});

// API Routes Mounting
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/samples', sampleRoutes);
app.use('/api/v1', commerceRoutes);
app.use('/api/v1/admin', adminRoutes);

// 404 Route Handler
app.use((req, res, next) => {
  next(new AppError(`Tuyến đường ${req.originalUrl} không tồn tại trên hệ thống`, 404));
});

// Global Error Middleware (Bắt buộc để ở cuối cùng)
app.use(errorHandler);

export default app;
