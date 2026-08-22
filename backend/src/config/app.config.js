import dotenv from 'dotenv';
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  dbUrl: process.env.DATABASE_URL || '',
  jwt: {
    secret: process.env.JWT_SECRET || 'default_jwt_secret_key_change_me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshExpiresInDays: parseInt(process.env.REFRESH_TOKEN_EXPIRES_DAYS || '30', 10),
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
  },
  frontendAuthUrl: process.env.FRONTEND_AUTH_URL || 'http://localhost:3000/auth.html',
  backendUrl: process.env.BACKEND_URL || `http://localhost:${process.env.PORT || '5000'}`,
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    },
    facebook: {
      clientId: process.env.FACEBOOK_CLIENT_ID || '',
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || '',
      graphVersion: process.env.FACEBOOK_GRAPH_VERSION || 'v23.0',
    },
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 phút
    max: 100, // Tối đa 100 request / 15 phút mỗi IP
  },
};
