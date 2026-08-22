import prisma from '../database/prismaClient.js';

export class CommerceRepository {
  constructor(client = prisma) { this.db = client; }

  categories() {
    return this.db.category.findMany({
      where: { isActive: true }, orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { products: true } } },
    });
  }

  products({ type, category, search, featured } = {}) {
    return this.db.product.findMany({
      where: {
        status: 'ACTIVE',
        ...(type && { type }),
        ...(featured !== undefined && { isFeatured: featured }),
        ...(category && { category: { slug: category } }),
        ...(search && { OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { variants: { some: { sku: { contains: search, mode: 'insensitive' } } } },
        ] }),
      },
      include: {
        category: true, images: { orderBy: { sortOrder: 'asc' } },
        variants: { where: { isActive: true }, include: { inventory: true } },
        reviews: { where: { status: { in: ['APPROVED', 'PINNED'] } }, select: { rating: true } },
      },
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
    });
  }

  product(idOrSlug) {
    return this.db.product.findFirst({
      where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }], status: 'ACTIVE' },
      include: {
        category: true, images: { orderBy: { sortOrder: 'asc' } },
        variants: { where: { isActive: true }, include: { inventory: true } },
        reviews: {
          where: { status: { in: ['APPROVED', 'PINNED'] } },
          include: { replies: { include: { author: { select: { name: true } } } } },
          orderBy: [{ status: 'desc' }, { createdAt: 'desc' }],
        },
      },
    });
  }

  cart(userId) {
    return this.db.cart.findFirst({
      where: { userId }, include: { items: { include: { variant: { include: {
        product: { include: { images: { where: { isPrimary: true }, take: 1 } } },
        inventory: true,
      } } } } },
    });
  }

  async replaceCart(userId, items) {
    return this.db.$transaction(async (tx) => {
      let cart = await tx.cart.findFirst({ where: { userId } });
      if (!cart) cart = await tx.cart.create({ data: { userId } });
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      if (items.length) await tx.cartItem.createMany({
        data: items.map((item) => ({ cartId: cart.id, variantId: item.variantId, quantity: item.quantity })),
      });
      return cart;
    });
  }

  variants(ids) {
    return this.db.productVariant.findMany({
      where: { id: { in: ids }, isActive: true },
      include: { product: true, inventory: true },
    });
  }

  transaction(fn) { return this.db.$transaction(fn); }

  userOrders(userId) {
    return this.db.order.findMany({
      where: { userId }, include: { items: true, payments: true, shipment: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  allOrders(query = {}) {
    return this.db.order.findMany({
      where: {
        ...(query.status && { status: query.status }),
        ...(query.search && { OR: [
          { code: { contains: query.search, mode: 'insensitive' } },
          { customerName: { contains: query.search, mode: 'insensitive' } },
          { customerPhone: { contains: query.search } },
        ] }),
      },
      include: { items: true, payments: true, shipment: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const commerceRepository = new CommerceRepository();
