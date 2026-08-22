import jwt from 'jsonwebtoken';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { findUnique } = vi.hoisted(() => ({ findUnique: vi.fn() }));
vi.mock('../../src/database/prismaClient.js', () => ({
  default: { user: { findUnique } },
}));

import { authenticateJWT, requireRole } from '../../src/core/authMiddleware.js';
import { config } from '../../src/config/app.config.js';

const response = {};
const runAuth = async (authorization) => {
  const req = { headers: { ...(authorization && { authorization }) } };
  const next = vi.fn();
  await authenticateJWT(req, response, next);
  return { req, error: next.mock.calls[0]?.[0] };
};

describe('Authentication and authorization middleware', () => {
  beforeEach(() => findUnique.mockReset());

  it('rejects a missing token', async () => {
    const { error } = await runAuth();
    expect(error).toMatchObject({ statusCode: 401 });
  });

  it('rejects an expired token', async () => {
    const token = jwt.sign({ id: 'user-1', type: 'access' }, config.jwt.secret, { expiresIn: -1 });
    const { error } = await runAuth(`Bearer ${token}`);
    expect(error).toMatchObject({ statusCode: 401 });
  });

  it('rejects a user that was blocked after the token was issued', async () => {
    findUnique.mockResolvedValue({ id: 'user-1', role: 'USER', status: 'BLOCKED' });
    const token = jwt.sign({ id: 'user-1', role: 'USER', type: 'access' }, config.jwt.secret);
    const { error } = await runAuth(`Bearer ${token}`);
    expect(error).toMatchObject({ statusCode: 403 });
  });

  it('uses the latest database role and rejects an insufficient role', async () => {
    findUnique.mockResolvedValue({ id: 'user-1', email: 'user@test.vn', name: 'User', role: 'USER', status: 'ACTIVE' });
    const token = jwt.sign({ id: 'user-1', role: 'ADMIN', type: 'access' }, config.jwt.secret);
    const { req, error } = await runAuth(`Bearer ${token}`);
    expect(error).toBeUndefined();

    const next = vi.fn();
    requireRole('ADMIN')(req, response, next);
    expect(next.mock.calls[0][0]).toMatchObject({ statusCode: 403 });
  });

  it('accepts an active user with the required role', async () => {
    findUnique.mockResolvedValue({ id: 'admin-1', email: 'admin@test.vn', name: 'Admin', role: 'ADMIN', status: 'ACTIVE' });
    const token = jwt.sign({ id: 'admin-1', role: 'ADMIN', type: 'access' }, config.jwt.secret);
    const { req, error } = await runAuth(`Bearer ${token}`);
    expect(error).toBeUndefined();
    const next = vi.fn();
    requireRole('ADMIN')(req, response, next);
    expect(next).toHaveBeenCalledWith();
  });
});
