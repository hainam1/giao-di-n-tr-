import prisma from '../../database/prismaClient.js';
import { successResponse } from '../../core/responseHandler.js';
import { AppError } from '../../core/errorHandler.js';
import { commerceService } from './commerce.service.js';

export const getCategories = async (_req, res, next) => {
  try { return successResponse(res, { data: await commerceService.categories() }); } catch (e) { next(e); }
};
export const getProducts = async (req, res, next) => {
  try { return successResponse(res, { data: await commerceService.products(req.query) }); } catch (e) { next(e); }
};
export const getProduct = async (req, res, next) => {
  try { return successResponse(res, { data: await commerceService.product(req.params.id) }); } catch (e) { next(e); }
};
export const getCart = async (req, res, next) => {
  try { return successResponse(res, { data: await commerceService.getCart(req.user.id) }); } catch (e) { next(e); }
};
export const putCart = async (req, res, next) => {
  try { return successResponse(res, { data: await commerceService.replaceCart(req.user.id, req.body.items) }); } catch (e) { next(e); }
};
export const checkout = async (req, res, next) => {
  try { return successResponse(res, { statusCode: 201, data: await commerceService.checkout(req.user.id, req.body) }); } catch (e) { next(e); }
};
export const myOrders = async (req, res, next) => {
  try { return successResponse(res, { data: await commerceService.repo.userOrders(req.user.id) }); } catch (e) { next(e); }
};
export const createReview = async (req, res, next) => {
  try {
    const product = await prisma.product.findFirst({ where: { OR: [{ id: req.params.productId }, { slug: req.params.productId }] } });
    if (!product) throw new AppError('Không tìm thấy sản phẩm', 404);
    const review = await prisma.review.create({ data: {
      productId: product.id, userId: req.user.id, authorName: req.body.authorName || req.user.name,
      rating: Number(req.body.rating), content: req.body.content, status: 'PENDING',
    } });
    return successResponse(res, { statusCode: 201, data: review });
  } catch (e) { next(e); }
};
export const createInquiry = async (req, res, next) => {
  try { return successResponse(res, { statusCode: 201, data: await prisma.contactInquiry.create({ data: req.body }) }); } catch (e) { next(e); }
};
export const notifications = async (req, res, next) => {
  try { return successResponse(res, { data: await prisma.notification.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: 'desc' } }) }); } catch (e) { next(e); }
};
export const markNotificationsRead = async (req, res, next) => {
  try { await prisma.notification.updateMany({ where: { userId: req.user.id, isRead: false }, data: { isRead: true, readAt: new Date() } }); return successResponse(res, { message: 'Đã đọc tất cả thông báo' }); } catch (e) { next(e); }
};
export const getTestimonials = async (_req, res, next) => {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: { status: { in: ['APPROVED', 'PINNED'] } },
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
    });
    return successResponse(res, { data: testimonials });
  } catch (e) { next(e); }
};
export const createTestimonial = async (req, res, next) => {
  try {
    const content = String(req.body.content || '').trim();
    const authorName = String(req.body.authorName || req.user.name || '').trim();
    const rating = Number(req.body.rating || 5);
    if (!authorName || !content) throw new AppError('Vui lòng nhập tên và nội dung cảm nhận', 400);
    if (content.length > 2000) throw new AppError('Nội dung cảm nhận tối đa 2000 ký tự', 400);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new AppError('Số sao phải từ 1 đến 5', 400);
    const testimonial = await prisma.testimonial.create({ data: {
      userId: req.user.id,
      authorName,
      content,
      rating,
      status: 'PENDING',
    } });
    return successResponse(res, { statusCode: 201, data: testimonial });
  } catch (e) { next(e); }
};

export const validateVoucher = async (req, res, next) => {
  try {
    const { code, orderValue } = req.body;
    const result = await commerceService.validateVoucher(code, orderValue);
    return successResponse(res, { data: result, message: 'Áp dụng mã giảm giá thành công' });
  } catch (e) { next(e); }
};

