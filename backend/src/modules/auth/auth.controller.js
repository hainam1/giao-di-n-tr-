import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../../config/app.config.js';
import { successResponse } from '../../core/responseHandler.js';
import { AppError } from '../../core/errorHandler.js';

// Dữ liệu giả lập fallback khi DB chưa kết nối
const MOCK_USERS = [
  {
    id: 'admin-id-123',
    email: 'admin@boilerplate.com',
    passwordHash: bcrypt.hashSync('admin123', 10),
    name: 'System Admin',
    role: 'ADMIN',
  },
  {
    id: 'user-id-456',
    email: 'user@boilerplate.com',
    passwordHash: bcrypt.hashSync('user123', 10),
    name: 'Demo User',
    role: 'USER',
  },
];

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = MOCK_USERS.find((u) => u.email === email);
    if (!user) {
      throw new AppError('Email hoặc mật khẩu không chính xác', 401);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Email hoặc mật khẩu không chính xác', 401);
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    return successResponse(res, {
      message: 'Đăng nhập thành công',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    return successResponse(res, {
      message: 'Lấy thông tin người dùng thành công',
      data: { user: req.user },
    });
  } catch (err) {
    next(err);
  }
};
