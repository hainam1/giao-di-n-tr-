import dotenv from 'dotenv';
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  dbUrl: process.env.DATABASE_URL || '',
  jwt: {
    secret: process.env.JWT_SECRET || 'default_jwt_secret_key_change_me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 phút
    max: 100, // Tối đa 100 request / 15 phút mỗi IP
  },
};
