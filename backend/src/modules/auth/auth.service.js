import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../../config/app.config.js';
import { AppError } from '../../core/errorHandler.js';
import { userRepository } from '../../repositories/user.repository.js';
import { sessionRepository } from '../../repositories/session.repository.js';

const publicUser = (user) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  phone: user.phone,
  role: user.role,
  status: user.status,
  avatarUrl: user.avatarUrl,
  note: user.note,
  lastLoginAt: user.lastLoginAt,
});

export class AuthService {
  constructor(repository = userRepository, sessions = sessionRepository) {
    this.users = repository;
    this.sessions = sessions;
  }

  accessToken(user) {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name, type: 'access' },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn },
    );
  }

  newRefreshToken() {
    const token = crypto.randomBytes(48).toString('base64url');
    return { token, hash: crypto.createHash('sha256').update(token).digest('hex') };
  }

  sessionData(userId, hash, metadata = {}) {
    return {
      userId,
      refreshTokenHash: hash,
      device: metadata.device || null,
      ipAddress: metadata.ipAddress || null,
      userAgent: metadata.userAgent || null,
      expiresAt: new Date(Date.now() + config.jwt.refreshExpiresInDays * 86400000),
    };
  }

  async login(email, password, metadata = {}) {
    const user = await this.users.findByEmail(email);
    if (!user || user.status !== 'ACTIVE') {
      throw new AppError('Email hoặc mật khẩu không chính xác', 401);
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      throw new AppError('Email hoặc mật khẩu không chính xác', 401);
    }

    const loggedInAt = new Date();
    await this.users.markLogin(user.id, loggedInAt);

    const safeUser = publicUser({ ...user, lastLoginAt: loggedInAt });
    const token = this.accessToken(user);
    const refresh = this.newRefreshToken();
    await this.sessions.create(this.sessionData(user.id, refresh.hash, metadata));

    return { token, refreshToken: refresh.token, user: safeUser };
  }

  async getProfile(userId) {
    const user = await this.users.findActiveById(userId);
    if (!user) {
      throw new AppError('Tài khoản không tồn tại hoặc đã bị khóa', 401);
    }
    return publicUser(user);
  }

  async register({ name, email, phone, password, acceptTerms, acceptPrivacy, termsVersion }) {
    const existing = await this.users.findByEmail(email);
    if (existing) throw new AppError('Email đã được sử dụng', 409);
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.users.createUser({
      name, email: email.toLowerCase(), phone, password: passwordHash,
      termsAcceptedAt: acceptTerms ? new Date() : null,
      privacyAcceptedAt: acceptPrivacy ? new Date() : null,
      termsVersion,
    });
    return this.login(user.email, password);
  }

  async updateProfile(userId, data) {
    const { address, ...profile } = data;
    const user = await this.users.updateProfile(userId, {
      ...profile,
      ...(address && {
        addresses: {
          deleteMany: { isDefault: true },
          create: { ...address, isDefault: true },
        },
      }),
    });
    return publicUser(user);
  }

  async refresh(refreshToken, metadata = {}) {
    const oldHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const session = await this.sessions.findValid(oldHash);
    if (!session || session.user.status !== 'ACTIVE') {
      throw new AppError('Refresh token không hợp lệ, đã hết hạn hoặc tài khoản bị khóa', 401);
    }
    const refresh = this.newRefreshToken();
    const rotated = await this.sessions.rotate(
      session.id,
      oldHash,
      this.sessionData(session.userId, refresh.hash, metadata),
    );
    if (!rotated) throw new AppError('Refresh token đã được sử dụng', 401);
    return { token: this.accessToken(session.user), refreshToken: refresh.token };
  }

  async logout(refreshToken) {
    const hash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await this.sessions.revoke(hash);
  }
}

export const authService = new AuthService();
