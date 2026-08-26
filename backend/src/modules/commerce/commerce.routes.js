import { Router } from 'express';
import { authenticateJWT } from '../../core/authMiddleware.js';
import * as c from './commerce.controller.js';

const router = Router();
router.get('/categories', c.getCategories);
router.get('/products', c.getProducts);
router.get('/products/:id', c.getProduct);
router.get('/testimonials', c.getTestimonials);
router.post('/testimonials', authenticateJWT, c.createTestimonial);
router.post('/products/:productId/reviews', authenticateJWT, c.createReview);
router.post('/inquiries', c.createInquiry);
router.get('/cart', authenticateJWT, c.getCart);
router.put('/cart', authenticateJWT, c.putCart);
router.post('/vouchers/validate', c.validateVoucher);
router.post('/orders', authenticateJWT, c.checkout);

router.get('/orders/my', authenticateJWT, c.myOrders);
router.get('/notifications', authenticateJWT, c.notifications);
router.patch('/notifications/read-all', authenticateJWT, c.markNotificationsRead);
export default router;
