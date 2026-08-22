import bcrypt from 'bcryptjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '../../src/modules/auth/auth.service.js';

describe('AuthService', () => {
  let repository;
  let sessions;
  let service;

  beforeEach(() => {
    repository = {
      findByEmail: vi.fn(),
      findActiveById: vi.fn(),
      markLogin: vi.fn().mockResolvedValue(undefined),
    };
    sessions = {
      create: vi.fn().mockResolvedValue({ id: 'session-1' }),
      findValid: vi.fn(),
      rotate: vi.fn(),
      revoke: vi.fn().mockResolvedValue({ count: 1 }),
    };
    service = new AuthService(repository, sessions);
  });

  it('authenticates an active database user without exposing password', async () => {
    repository.findByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'admin@tradao.vn',
      password: await bcrypt.hash('admin123', 4),
      name: 'Admin',
      phone: null,
      role: 'ADMIN',
      status: 'ACTIVE',
      avatarUrl: null,
      note: null,
      lastLoginAt: null,
    });

    const result = await service.login('admin@tradao.vn', 'admin123');

    expect(result.token).toEqual(expect.any(String));
    expect(result.refreshToken).toEqual(expect.any(String));
    expect(result.user).not.toHaveProperty('password');
    expect(result.user.role).toBe('ADMIN');
    expect(repository.markLogin).toHaveBeenCalledWith('user-1', expect.any(Date));
    expect(sessions.create).toHaveBeenCalledWith(expect.objectContaining({ userId: 'user-1' }));
  });

  it('rejects invalid credentials and blocked users consistently', async () => {
    repository.findByEmail.mockResolvedValue(null);
    await expect(service.login('missing@tradao.vn', 'secret123')).rejects.toMatchObject({
      statusCode: 401,
    });

    repository.findByEmail.mockResolvedValue({
      id: 'blocked-1',
      status: 'BLOCKED',
      password: await bcrypt.hash('secret123', 4),
    });
    await expect(service.login('blocked@tradao.vn', 'secret123')).rejects.toMatchObject({
      statusCode: 401,
    });
  });

  it('loads the latest active profile from the repository', async () => {
    repository.findActiveById.mockResolvedValue({
      id: 'user-1',
      email: 'user@tradao.vn',
      name: 'User',
      phone: null,
      role: 'USER',
      status: 'ACTIVE',
      avatarUrl: null,
      note: null,
      lastLoginAt: null,
    });

    const profile = await service.getProfile('user-1');
    expect(profile.email).toBe('user@tradao.vn');
    expect(repository.findActiveById).toHaveBeenCalledWith('user-1');
  });

  it('rotates a valid refresh token and rejects a blocked session user', async () => {
    sessions.findValid.mockResolvedValueOnce({
      id: 'session-1', userId: 'user-1',
      user: { id: 'user-1', email: 'user@tradao.vn', name: 'User', role: 'USER', status: 'ACTIVE' },
    });
    sessions.rotate.mockResolvedValueOnce({ id: 'session-2' });
    const refreshed = await service.refresh('r'.repeat(48));
    expect(refreshed.token).toEqual(expect.any(String));
    expect(refreshed.refreshToken).toEqual(expect.any(String));
    expect(sessions.rotate).toHaveBeenCalled();

    sessions.findValid.mockResolvedValueOnce({
      id: 'session-3', userId: 'blocked-1', user: { status: 'BLOCKED' },
    });
    await expect(service.refresh('b'.repeat(48))).rejects.toMatchObject({ statusCode: 401 });
  });

  it('revokes the current refresh session on logout', async () => {
    await service.logout('r'.repeat(48));
    expect(sessions.revoke).toHaveBeenCalledWith(expect.stringMatching(/^[a-f0-9]{64}$/));
  });
});
