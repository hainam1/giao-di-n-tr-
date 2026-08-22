import prisma from '../database/prismaClient.js';

export class SessionRepository {
  constructor(client = prisma) {
    this.client = client;
  }

  create(data) {
    return this.client.session.create({ data });
  }

  findValid(refreshTokenHash, now = new Date()) {
    return this.client.session.findFirst({
      where: { refreshTokenHash, revokedAt: null, expiresAt: { gt: now } },
      include: { user: true },
    });
  }

  async rotate(sessionId, oldHash, data) {
    return this.client.$transaction(async (tx) => {
      const revoked = await tx.session.updateMany({
        where: { id: sessionId, refreshTokenHash: oldHash, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      if (revoked.count !== 1) return null;
      return tx.session.create({ data });
    });
  }

  revoke(refreshTokenHash) {
    return this.client.session.updateMany({
      where: { refreshTokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}

export const sessionRepository = new SessionRepository();
