import { afterAll, describe, expect, it } from 'vitest';
import { disconnectPrisma, prisma } from '../../src/database/prismaClient.js';

describe('Prisma database integration', () => {
  afterAll(async () => {
    await disconnectPrisma();
  });

  it('connects to PostgreSQL and can query the seeded schema', async () => {
    await expect(prisma.$queryRaw`SELECT 1 AS connected`).resolves.toEqual([
      { connected: 1 },
    ]);
    await expect(prisma.user.count()).resolves.toBeGreaterThanOrEqual(2);
  });

  it('executes related reads atomically in a transaction', async () => {
    const [users, products, variants] = await prisma.$transaction([
      prisma.user.count(),
      prisma.product.count(),
      prisma.productVariant.count(),
    ]);

    expect(users).toBeGreaterThanOrEqual(2);
    expect(products).toBe(16);
    expect(variants).toBe(16);
  });

  it('exposes the complete authentication, promotion, and shipping models', async () => {
    const [
      oauthAccounts,
      sessions,
      resetTokens,
      vouchers,
      shippingMethods,
      shipments,
    ] = await prisma.$transaction([
      prisma.oAuthAccount.count(),
      prisma.session.count(),
      prisma.passwordResetToken.count(),
      prisma.voucher.count(),
      prisma.shippingMethod.count(),
      prisma.shipment.count(),
    ]);

    expect(oauthAccounts).toBeGreaterThanOrEqual(0);
    expect(sessions).toBeGreaterThanOrEqual(0);
    expect(resetTokens).toBeGreaterThanOrEqual(0);
    expect(vouchers).toBeGreaterThanOrEqual(1);
    expect(shippingMethods).toBeGreaterThanOrEqual(1);
    expect(shipments).toBeGreaterThanOrEqual(1);
  });

  it('stores homepage testimonials and legal consent audit data', async () => {
    const [testimonialCount, customer] = await prisma.$transaction([
      prisma.testimonial.count({ where: { status: { in: ['APPROVED', 'PINNED'] } } }),
      prisma.user.findUnique({ where: { email: 'khachhang@gmail.com' } }),
    ]);

    expect(testimonialCount).toBeGreaterThanOrEqual(1);
    expect(customer?.termsAcceptedAt).toBeInstanceOf(Date);
    expect(customer?.privacyAcceptedAt).toBeInstanceOf(Date);
    expect(customer?.termsVersion).toBe('2026-08-22');
  });
});
