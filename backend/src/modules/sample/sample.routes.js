import { Router } from 'express';
import {
  getSamples,
  getSampleById,
  createSample,
  updateSample,
  deleteSample,
} from './sample.controller.js';
import {
  createSampleSchema,
  updateSampleSchema,
  getSampleByIdSchema,
} from './sample.validation.js';
import { validate } from '../../core/validateMiddleware.js';
import { authenticateJWT, requireRole } from '../../core/authMiddleware.js';

const router = Router();

// Public routes
router.get('/', getSamples);
router.get('/:id', validate(getSampleByIdSchema), getSampleById);

// Protected routes (Admin role required)
router.post('/', authenticateJWT, requireRole('ADMIN'), validate(createSampleSchema), createSample);
router.put('/:id', authenticateJWT, requireRole('ADMIN'), validate(updateSampleSchema), updateSample);
router.delete('/:id', authenticateJWT, requireRole('ADMIN'), validate(getSampleByIdSchema), deleteSample);

export default router;
