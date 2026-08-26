import { describe, expect, it, vi } from 'vitest';
import { CommerceService } from '../../src/modules/commerce/commerce.service.js';

const activeVoucher = {
  id: 'voucher-1',
  code: 'XATON20',
  name: 'Voucher Test',
  discountType: 'PERCENTAGE',
  discountValue: 20,
  minimumOrderValue: 100000,
  maximumDiscount: 200000,
  startsAt: new Date(Date.now() - 86400000),
  expiresAt: new Date(Date.now() + 86400000),
  isActive: true,
};

describe('CommerceService voucher validation', () => {
  it('loads a voucher through the repository contract and calculates its discount', async () => {
    const repository = { voucherByCode: vi.fn().mockResolvedValue(activeVoucher) };
    const service = new CommerceService(repository);

    const result = await service.validateVoucher('xaton20', 1000000);

    expect(repository.voucherByCode).toHaveBeenCalledWith('XATON20');
    expect(result.discountAmount).toBe(200000);
    expect(result.finalTotal).toBe(800000);
  });

  it('returns a 404 operational error when the voucher does not exist', async () => {
    const service = new CommerceService({ voucherByCode: vi.fn().mockResolvedValue(null) });

    await expect(service.validateVoucher('missing', 1000000)).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});
