import prisma from '../../database/prismaClient.js';
import { successResponse } from '../../core/responseHandler.js';
import { AppError } from '../../core/errorHandler.js';
import { commerceRepository } from '../../repositories/commerce.repository.js';

const productDto = (product) => {
  const variant = product.variants?.[0];
  const image = product.images?.find((item) => item.isPrimary) || product.images?.[0];
  const soldQuantity = (product.variants || []).flatMap((item) => item.orderItems || [])
    .reduce((sum, item) => sum + item.quantity, 0);
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    category: product.category?.name || '',
    categoryId: product.categoryId,
    type: product.type,
    status: product.status,
    isWebOnline: product.status === 'ACTIVE',
    sku: variant?.sku || '',
    unit: variant?.unit || '',
    weight: variant?.weightGrams ? `${variant.weightGrams}g` : (variant?.volumeMl ? `${variant.volumeMl}ml` : variant?.unit || ''),
    price: Number(variant?.price || 0),
    stock: variant?.inventory?.quantity || 0,
    soldQuantity,
    imageUrl: image?.url || '',
    description: product.description || '',
    origin: product.origin || '',
  };
};

const inventoryDto = (item) => ({
  variantId: item.variantId,
  productId: item.variant.productId,
  productName: item.variant.product.name,
  sku: item.variant.sku,
  category: item.variant.product.type,
  currentStock: item.quantity,
  reservedStock: item.reserved,
  minThreshold: item.variant.lowStockThreshold,
  unit: item.variant.unit,
  status: item.quantity <= item.variant.lowStockThreshold
    ? (item.quantity <= 0 ? 'CRITICAL' : 'LOW_STOCK')
    : 'NORMAL',
});

const readVoucherMetadata = (note) => {
  try { return JSON.parse(note || '{}'); } catch { return { note: note || '' }; }
};

const voucherDto = (id, rows) => {
  const metadata = readVoucherMetadata(rows[0]?.note);
  const lineItems = rows.map((row) => {
    const detail = readVoucherMetadata(row.note);
    return {
      variantId: row.variantId,
      sku: row.variant.sku,
      productName: row.variant.product.name,
      unit: row.variant.unit,
      quantity: Math.abs(row.quantity),
      unitPrice: Number(detail.unitPrice || 0),
      totalAmount: Math.abs(row.quantity) * Number(detail.unitPrice || 0),
      batchCode: detail.batchCode || '',
      expiryDate: detail.expiryDate || null,
      stockAfter: row.balanceAfter,
    };
  });
  return {
    id,
    voucherType: rows[0]?.type === 'IMPORT' ? 'IMPORT' : 'EXPORT',
    partnerName: metadata.partnerName || 'N/A',
    partnerPhone: metadata.partnerPhone || '',
    createdAt: rows[0]?.createdAt,
    status: 'COMPLETED',
    note: metadata.note || '',
    totalQuantity: lineItems.reduce((sum, item) => sum + item.quantity, 0),
    totalAmount: lineItems.reduce((sum, item) => sum + item.totalAmount, 0),
    lineItems,
  };
};

export const orders = async (req, res, next) => {
  try { return successResponse(res, { data: await commerceRepository.allOrders(req.query) }); } catch (e) { next(e); }
};

export const orderDetail = async (req, res, next) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        items: { include: { variant: { include: { inventory: true } } } },
        payments: true,
        shipment: true,
        statusHistory: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!order) throw new AppError('Không tìm thấy đơn hàng', 404);
    return successResponse(res, { data: {
      ...order,
      itemsWithStock: order.items.map((item) => ({
        ...item,
        currentStock: item.variant?.inventory?.quantity || 0,
        location: 'Kho chính',
      })),
    } });
  } catch (e) { next(e); }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const allowed = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPING', 'COMPLETED', 'CANCELLED', 'REFUNDED'];
    if (!allowed.includes(req.body.status)) throw new AppError('Trạng thái đơn hàng không hợp lệ', 400);
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

export const products = async (req, res, next) => {
  try {
    const search = String(req.query.search || '').trim();
    const rows = await prisma.product.findMany({
      where: search ? { OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { variants: { some: { sku: { contains: search, mode: 'insensitive' } } } },
      ] } : {},
      include: {
        category: true,
        images: { orderBy: { sortOrder: 'asc' } },
        variants: { include: { inventory: true, orderItems: { select: { quantity: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return successResponse(res, { data: rows.map(productDto) });
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
  try {
    const rows = await prisma.inventory.findMany({
      include: { variant: { include: { product: true } } },
      orderBy: { updatedAt: 'desc' },
    });
    return successResponse(res, { data: rows.map(inventoryDto) });
  } catch (e) { next(e); }
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
export const batches = async (_req, res, next) => {
  try {
    return successResponse(res, { data: await prisma.productionBatch.findMany({
      include: { items: { include: { variant: { include: { product: true } } } } },
      orderBy: { roastedAt: 'desc' },
    }) });
  } catch (e) { next(e); }
};
export const reviews = async (_req, res, next) => {
  try {
    const rows = await prisma.review.findMany({ include: { product: true, replies: true }, orderBy: { createdAt: 'desc' } });
    return successResponse(res, { data: rows.map((row) => ({ ...row, comment: row.content })) });
  } catch (e) { next(e); }
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

export const createWarehouseVoucher = async (req, res, next) => {
  try {
    const { items, partnerName, partnerPhone, batchCode, expiryDate, note } = req.body;
    if (!Array.isArray(items) || !items.length) throw new AppError('Phiếu kho phải có ít nhất một sản phẩm', 400);
    const referenceId = `PN-${Date.now()}`;
    await prisma.$transaction(async (tx) => {
      for (const item of items) {
        const quantity = Number(item.quantity);
        const unitPrice = Number(item.unitPrice || 0);
        if (!item.variantId || !Number.isInteger(quantity) || quantity <= 0 || unitPrice < 0) {
          throw new AppError('Dòng sản phẩm trong phiếu kho không hợp lệ', 400);
        }
        const current = await tx.inventory.findUnique({
          where: { variantId: item.variantId },
          include: { variant: true },
        });
        if (!current) throw new AppError('Không tìm thấy sản phẩm tồn kho', 404);
        const updated = await tx.inventory.update({
          where: { variantId: item.variantId },
          data: { quantity: { increment: quantity } },
        });
        await tx.inventoryTransaction.create({ data: {
          variantId: item.variantId,
          type: 'IMPORT',
          quantity,
          balanceAfter: updated.quantity,
          referenceType: 'WAREHOUSE_VOUCHER',
          referenceId,
          note: JSON.stringify({ partnerName, partnerPhone, batchCode, expiryDate, note, unitPrice }),
          createdBy: req.user.id,
        } });
      }
    });
    const rows = await prisma.inventoryTransaction.findMany({
      where: { referenceType: 'WAREHOUSE_VOUCHER', referenceId },
      include: { variant: { include: { product: true } } },
    });
    return successResponse(res, { statusCode: 201, data: voucherDto(referenceId, rows) });
  } catch (e) { next(e); }
};

export const warehouseVouchers = async (req, res, next) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
    const endDate = req.query.endDate ? new Date(`${req.query.endDate}T23:59:59.999Z`) : null;
    const rows = await prisma.inventoryTransaction.findMany({
      where: {
        referenceType: 'WAREHOUSE_VOUCHER',
        ...(startDate || endDate ? { createdAt: {
          ...(startDate && { gte: startDate }),
          ...(endDate && { lte: endDate }),
        } } : {}),
      },
      include: { variant: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
    const grouped = rows.reduce((result, row) => {
      (result[row.referenceId] ||= []).push(row);
      return result;
    }, {});
    return successResponse(res, { data: Object.entries(grouped).map(([id, items]) => voucherDto(id, items)) });
  } catch (e) { next(e); }
};

export const warehouseVoucher = async (req, res, next) => {
  try {
    const rows = await prisma.inventoryTransaction.findMany({
      where: { referenceType: 'WAREHOUSE_VOUCHER', referenceId: req.params.id },
      include: { variant: { include: { product: true } } },
      orderBy: { createdAt: 'asc' },
    });
    if (!rows.length) throw new AppError('Không tìm thấy phiếu kho', 404);
    return successResponse(res, { data: voucherDto(req.params.id, rows) });
  } catch (e) { next(e); }
};

export const inventoryLogs = async (req, res, next) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
    const endDate = req.query.endDate ? new Date(`${req.query.endDate}T23:59:59.999Z`) : null;
    const rows = await prisma.inventoryTransaction.findMany({
      where: startDate || endDate ? { createdAt: {
        ...(startDate && { gte: startDate }),
        ...(endDate && { lte: endDate }),
      } } : {},
      include: { variant: { include: { product: true } }, createdByUser: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return successResponse(res, { data: rows.map((row) => ({
      id: row.id,
      voucherId: row.referenceId,
      productName: row.variant.product.name,
      sku: row.variant.sku,
      type: row.type,
      amount: row.quantity,
      reason: readVoucherMetadata(row.note).note || row.note || '',
      operator: row.createdByUser?.name || 'Hệ thống',
      createdAt: row.createdAt,
    })) });
  } catch (e) { next(e); }
};

export const mobileHome = async (_req, res, next) => {
  try {
    const [recentOrders, products, inventoryRows, pendingReviews] = await prisma.$transaction([
      prisma.order.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { items: true, shipment: true } }),
      prisma.product.findMany({
        where: { status: 'ACTIVE' }, take: 4,
        include: { category: true, images: true, variants: { include: { inventory: true, orderItems: { select: { quantity: true } } } } },
      }),
      prisma.inventory.findMany({ include: { variant: { include: { product: true } } }, orderBy: { updatedAt: 'desc' } }),
      prisma.review.findMany({ where: { status: 'PENDING' }, take: 5, include: { product: true } }),
    ]);
    return successResponse(res, { data: {
      recentOrders,
      featuredProducts: products.map(productDto),
      inventory: inventoryRows.map(inventoryDto),
      pendingReviews: pendingReviews.map((row) => ({ ...row, comment: row.content })),
    } });
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

export const toggleProductWebStatus = async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    if (!product) throw new AppError('Sản phẩm không tồn tại', 404);
    const nextStatus = product.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const updated = await prisma.product.update({
      where: { id: req.params.id },
      data: { status: nextStatus },
    });
    return successResponse(res, { data: updated, message: `Đã đổi trạng thái sản phẩm sang ${nextStatus}` });
  } catch (e) { next(e); }
};

export const publishProduct = async (req, res, next) => {
  try {
    return await saveProduct(req, res, next);
  } catch (e) { next(e); }
};

export const createOrUpdateShipment = async (req, res, next) => {
  try {
    const { carrier, trackingCode, trackingUrl, status = 'SHIPPING', estimatedDelivery } = req.body;
    const orderId = req.params.id;
    const shipment = await prisma.shipment.upsert({
      where: { orderId },
      update: { carrier, trackingCode, trackingUrl, status, ...(estimatedDelivery && { estimatedDelivery: new Date(estimatedDelivery) }) },
      create: { orderId, carrier, trackingCode, trackingUrl, status, ...(estimatedDelivery && { estimatedDelivery: new Date(estimatedDelivery) }) },
    });
    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'SHIPPING' },
    });
    return successResponse(res, { data: shipment, message: 'Đã cập nhật vận đơn thành công' });
  } catch (e) { next(e); }
};

