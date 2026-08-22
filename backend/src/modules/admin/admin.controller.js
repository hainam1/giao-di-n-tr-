import prisma from '../../database/prismaClient.js';
import { successResponse } from '../../core/responseHandler.js';
import { AppError } from '../../core/errorHandler.js';
import { commerceRepository } from '../../repositories/commerce.repository.js';

export const orders = async (req, res, next) => {
  try { return successResponse(res, { data: await commerceRepository.allOrders(req.query) }); } catch (e) { next(e); }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const order = await prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({ where: { id: req.params.id }, data: {
        status: req.body.status,
        ...(req.body.status === 'COMPLETED' && { completedAt: new Date() }),
        ...(req.body.status === 'CANCELLED' && { cancelledAt: new Date() }),
      } });
      await tx.orderStatusHistory.create({ data: {
        orderId: updated.id, status: req.body.status, note: req.body.note, changedBy: req.user.id,
      } });
      return updated;
    });
    return successResponse(res, { data: order });
  } catch (e) { next(e); }
};

export const saveProduct = async (req, res, next) => {
  try {
    const { categoryId, name, slug, type = 'TEA', description, origin, standard, flavor,
      packaging, isFeatured = false, sku, unit, price, weightGrams, volumeMl, stock = 0, imageUrl } = req.body;
    const product = await prisma.$transaction(async (tx) => {
      const p = req.params.id
        ? await tx.product.update({ where: { id: req.params.id }, data: { categoryId, name, slug, type, description, origin, standard, flavor, packaging, isFeatured } })
        : await tx.product.create({ data: { categoryId, name, slug, type, description, origin, standard, flavor, packaging, isFeatured, status: 'ACTIVE', publishedAt: new Date() } });
      if (sku) {
        const variant = await tx.productVariant.upsert({
          where: { sku }, update: { productId: p.id, name: unit, unit, price, weightGrams, volumeMl },
          create: { productId: p.id, sku, name: unit, unit, price, weightGrams, volumeMl },
        });
        await tx.inventory.upsert({ where: { variantId: variant.id }, update: {}, create: { variantId: variant.id, quantity: Number(stock) } });
      }
      if (imageUrl) {
        const current = await tx.productImage.findFirst({ where: { productId: p.id, isPrimary: true } });
        if (current) await tx.productImage.update({ where: { id: current.id }, data: { url: imageUrl, altText: name } });
        else await tx.productImage.create({ data: { productId: p.id, url: imageUrl, altText: name, isPrimary: true } });
      }
      return p;
    });
    return successResponse(res, { statusCode: req.params.id ? 200 : 201, data: product });
  } catch (e) { next(e); }
};

export const archiveProduct = async (req, res, next) => {
  try { return successResponse(res, { data: await prisma.product.update({ where: { id: req.params.id }, data: { status: 'ARCHIVED' } }) }); } catch (e) { next(e); }
};
export const createCategory = async (req, res, next) => {
  try { return successResponse(res, { statusCode: 201, data: await prisma.category.create({ data: req.body }) }); } catch (e) { next(e); }
};
export const deleteCategory = async (req, res, next) => {
  try {
    const count = await prisma.product.count({ where: { categoryId: req.params.id } });
    if (count) throw new AppError('Không thể xóa danh mục đang có sản phẩm', 409);
    await prisma.category.delete({ where: { id: req.params.id } });
    return successResponse(res, { message: 'Đã xóa danh mục' });
  } catch (e) { next(e); }
};
export const inventory = async (_req, res, next) => {
  try { return successResponse(res, { data: await prisma.inventory.findMany({ include: { variant: { include: { product: true } } } }) }); } catch (e) { next(e); }
};
export const adjustInventory = async (req, res, next) => {
  try {
    const quantity = Number(req.body.quantity);
    const result = await prisma.$transaction(async (tx) => {
      const current = await tx.inventory.findUnique({ where: { variantId: req.params.variantId } });
      if (!current || current.quantity + quantity < 0) throw new AppError('Tồn kho không hợp lệ', 409);
      const inventory = await tx.inventory.update({ where: { variantId: req.params.variantId }, data: { quantity: { increment: quantity } } });
      await tx.inventoryTransaction.create({ data: {
        variantId: req.params.variantId, type: 'ADJUSTMENT', quantity,
        balanceAfter: inventory.quantity, note: req.body.note, createdBy: req.user.id,
      } });
      return inventory;
    });
    return successResponse(res, { data: result });
  } catch (e) { next(e); }
};
export const createBatch = async (req, res, next) => {
  try {
    const { items = [], ...batch } = req.body;
    return successResponse(res, { statusCode: 201, data: await prisma.productionBatch.create({
      data: { ...batch, roastedAt: new Date(batch.roastedAt), weightKg: Number(batch.weightKg),
        qualityScore: batch.qualityScore ? Number(batch.qualityScore) : null,
        items: { create: items.map((i) => ({ variantId: i.variantId, quantity: Number(i.quantity) })) } },
    }) });
  } catch (e) { next(e); }
};
export const reviews = async (_req, res, next) => {
  try { return successResponse(res, { data: await prisma.review.findMany({ include: { product: true, replies: true }, orderBy: { createdAt: 'desc' } }) }); } catch (e) { next(e); }
};
export const moderateReview = async (req, res, next) => {
  try { return successResponse(res, { data: await prisma.review.update({ where: { id: req.params.id }, data: {
    status: req.body.status, moderatedBy: req.user.id, moderatedAt: new Date(),
  } }) }); } catch (e) { next(e); }
};
export const replyReview = async (req, res, next) => {
  try { return successResponse(res, { statusCode: 201, data: await prisma.reviewReply.create({ data: {
    reviewId: req.params.id, authorId: req.user.id, content: req.body.content,
  } }) }); } catch (e) { next(e); }
};
export const testimonials = async (_req, res, next) => {
  try {
    return successResponse(res, { data: await prisma.testimonial.findMany({
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    }) });
  } catch (e) { next(e); }
};
export const moderateTestimonial = async (req, res, next) => {
  try {
    const status = req.body.status;
    if (!['PENDING', 'APPROVED', 'PINNED', 'REJECTED'].includes(status)) {
      throw new AppError('Trạng thái cảm nhận không hợp lệ', 400);
    }
    return successResponse(res, { data: await prisma.testimonial.update({
      where: { id: req.params.id },
      data: { status, isPinned: status === 'PINNED' },
    }) });
  } catch (e) { next(e); }
};

export const dashboard = async (_req, res, next) => {
  try {
    const [orders, revenue, products, lowStock, pendingReviews, inquiries] = await prisma.$transaction([
      prisma.order.count(), prisma.order.aggregate({ _sum: { totalAmount: true }, where: { status: { notIn: ['CANCELLED', 'REFUNDED'] } } }),
      prisma.product.count({ where: { status: 'ACTIVE' } }),
      prisma.inventory.count({ where: { quantity: { lte: 5 } } }),
      prisma.review.count({ where: { status: 'PENDING' } }),
      prisma.contactInquiry.count({ where: { status: 'NEW' } }),
    ]);
    return successResponse(res, { data: { orders, revenue: revenue._sum.totalAmount || 0, products, lowStock, pendingReviews, inquiries } });
  } catch (e) { next(e); }
};

export const analytics = async (req, res, next) => {
  try {
    const days = Math.max(1, Math.min(365, Number(req.query.days || 30)));
    const from = new Date(Date.now() - days * 86400000);
    const products = await prisma.product.findMany({
      where: { status: 'ACTIVE' },
      include: {
        category: true,
        views: { where: { viewedAt: { gte: from } }, select: { id: true } },
        reviews: { where: { status: { in: ['APPROVED', 'PINNED'] } }, select: { rating: true } },
        variants: { include: { orderItems: { where: {
          order: { createdAt: { gte: from }, status: { notIn: ['CANCELLED', 'REFUNDED'] } },
        }, select: { quantity: true, subtotal: true } } } },
      },
    });
    const rows = products.map((p) => {
      const orderItems = p.variants.flatMap((v) => v.orderItems);
      const sold = orderItems.reduce((s, i) => s + i.quantity, 0);
      const revenue = orderItems.reduce((s, i) => s + Number(i.subtotal), 0);
      const rating = p.reviews.length ? p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length : 0;
      return {
        id: p.id, name: p.name, category: p.category.name, views: p.views.length,
        sold, revenue, conversion: p.views.length ? (sold / p.views.length) * 100 : 0,
        rating: Number(rating.toFixed(1)), reviewCount: p.reviews.length,
      };
    }).sort((a, b) => b.revenue - a.revenue);
    return successResponse(res, { data: {
      days, rows, totalRevenue: rows.reduce((s, r) => s + r.revenue, 0),
      totalSold: rows.reduce((s, r) => s + r.sold, 0),
    } });
  } catch (e) { next(e); }
};
