import { AppError } from '../../core/errorHandler.js';
import { commerceRepository } from '../../repositories/commerce.repository.js';

const serializeProduct = (product) => {
  const ratings = product.reviews || [];
  const rating = ratings.length ? ratings.reduce((s, r) => s + r.rating, 0) / ratings.length : 0;
  return { ...product, rating: Number(rating.toFixed(1)), reviewCount: ratings.length };
};

export class CommerceService {
  constructor(repository = commerceRepository) { this.repo = repository; }

  categories() { return this.repo.categories(); }
  async products(query) { return (await this.repo.products(query)).map(serializeProduct); }
  async product(id) {
    const product = await this.repo.product(id);
    if (!product) throw new AppError('Không tìm thấy sản phẩm', 404);
    return serializeProduct(product);
  }
  getCart(userId) { return this.repo.cart(userId); }

  async replaceCart(userId, items) {
    if (!Array.isArray(items)) throw new AppError('Giỏ hàng không hợp lệ', 400);
    const normalized = items.map((i) => ({
      variantId: String(i.variantId), quantity: Number(i.quantity),
    }));
    if (normalized.some((i) => !i.variantId || !Number.isInteger(i.quantity) || i.quantity < 1)) {
      throw new AppError('Số lượng sản phẩm không hợp lệ', 400);
    }
    const variants = await this.repo.variants(normalized.map((i) => i.variantId));
    if (variants.length !== normalized.length) throw new AppError('Có sản phẩm không tồn tại', 400);
    for (const item of normalized) {
      const variant = variants.find((v) => v.id === item.variantId);
      if (!variant.inventory || variant.inventory.quantity - variant.inventory.reserved < item.quantity) {
        throw new AppError(`Sản phẩm ${variant.product.name} không đủ tồn kho`, 409);
      }
    }
    await this.repo.replaceCart(userId, normalized);
    return this.repo.cart(userId);
  }

  async checkout(userId, body) {
    const cart = await this.repo.cart(userId);
    if (!cart?.items.length) throw new AppError('Giỏ hàng đang trống', 400);
    return this.repo.transaction(async (tx) => {
      const variantIds = cart.items.map((i) => i.variantId);
      const variants = await tx.productVariant.findMany({
        where: { id: { in: variantIds } }, include: { product: true, inventory: true },
      });
      let subtotal = 0;
      for (const item of cart.items) {
        const variant = variants.find((v) => v.id === item.variantId);
        if (!variant?.inventory || variant.inventory.quantity - variant.inventory.reserved < item.quantity) {
          throw new AppError(`${variant?.product.name || 'Sản phẩm'} không đủ tồn kho`, 409);
        }
        subtotal += Number(variant.price) * item.quantity;
      }
      const shippingFee = Number(body.shippingFee || 0);
      const code = `ORD-${Date.now().toString().slice(-8)}`;
      const order = await tx.order.create({
        data: {
          code, userId, customerName: body.customerName, customerEmail: body.customerEmail,
          customerPhone: body.customerPhone, shippingAddress: body.shippingAddress,
          shippingWard: body.shippingWard, shippingDistrict: body.shippingDistrict,
          shippingProvince: body.shippingProvince, customerNote: body.customerNote,
          subtotal, shippingFee, discountAmount: 0, totalAmount: subtotal + shippingFee,
          items: { create: cart.items.map((item) => {
            const v = variants.find((x) => x.id === item.variantId);
            return { variantId: v.id, productName: v.product.name, sku: v.sku, unit: v.unit,
              unitPrice: v.price, quantity: item.quantity, subtotal: Number(v.price) * item.quantity };
          }) },
          payments: { create: [{ method: body.paymentMethod || 'COD', amount: subtotal + shippingFee }] },
          statusHistory: { create: [{ status: 'PENDING', note: 'Đơn hàng được tạo thành công' }] },
        }, include: { items: true, payments: true },
      });
      for (const item of cart.items) {
        const inventory = await tx.inventory.update({
          where: { variantId: item.variantId }, data: { quantity: { decrement: item.quantity } },
        });
        await tx.inventoryTransaction.create({ data: {
          variantId: item.variantId, type: 'SALE', quantity: -item.quantity,
          balanceAfter: inventory.quantity, referenceType: 'ORDER', referenceId: order.id,
        } });
      }
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      return order;
    });
  }

  async validateVoucher(code, orderValue = 0) {
    if (!code) throw new AppError('Mã voucher không được để trống', 400);
    const voucher = await this.repo.client.voucher.findUnique({
      where: { code: code.toUpperCase() },
    });
    if (!voucher || !voucher.isActive) {
      throw new AppError('Mã giảm giá không tồn tại hoặc đã bị vô hiệu hóa', 404);
    }
    const now = new Date();
    if (now < voucher.startsAt || now > voucher.expiresAt) {
      throw new AppError('Mã giảm giá không trong thời gian sử dụng', 400);
    }
    const numOrderValue = Number(orderValue);
    if (voucher.minimumOrderValue && numOrderValue < Number(voucher.minimumOrderValue)) {
      throw new AppError(`Đơn hàng cần đạt tối thiểu ${Number(voucher.minimumOrderValue).toLocaleString('vi-VN')} ₫ để áp dụng mã này`, 400);
    }
    let discount = 0;
    if (voucher.discountType === 'PERCENTAGE') {
      discount = (numOrderValue * Number(voucher.discountValue)) / 100;
      if (voucher.maximumDiscount) {
        discount = Math.min(discount, Number(voucher.maximumDiscount));
      }
    } else {
      discount = Number(voucher.discountValue);
    }
    return {
      id: voucher.id,
      code: voucher.code,
      name: voucher.name,
      discountAmount: Math.round(discount),
      finalTotal: Math.max(0, Math.round(numOrderValue - discount)),
    };
  }
}

export const commerceService = new CommerceService();

