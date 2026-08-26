import { Router } from 'express';
import { authenticateJWT, requireRole } from '../../core/authMiddleware.js';
import * as a from './admin.controller.js';

const router = Router();
router.use(authenticateJWT, requireRole('ADMIN'));
router.get('/dashboard', a.dashboard);
router.get('/analytics', a.analytics);
router.get('/orders', a.orders);
router.patch('/orders/:id/status', a.updateOrderStatus);
router.post('/products', a.saveProduct);
router.post('/products/publish', a.publishProduct);
router.put('/products/:id', a.saveProduct);
router.patch('/products/:id/web-status', a.toggleProductWebStatus);
router.delete('/products/:id', a.archiveProduct);
router.post('/orders/:id/shipment', a.createOrUpdateShipment);

router.post('/categories', a.createCategory);
router.delete('/categories/:id', a.deleteCategory);
router.get('/inventory', a.inventory);
router.post('/inventory/:variantId/adjust', a.adjustInventory);
router.post('/batches', a.createBatch);
router.get('/reviews', a.reviews);
router.patch('/reviews/:id', a.moderateReview);
router.post('/reviews/:id/replies', a.replyReview);
router.get('/testimonials', a.testimonials);
router.patch('/testimonials/:id', a.moderateTestimonial);
export default router;
