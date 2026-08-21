import { Router } from 'express';
import { login, getProfile } from './auth.controller.js';
import { loginSchema } from './auth.validation.js';
import { validate } from '../../core/validateMiddleware.js';
import { authenticateJWT } from '../../core/authMiddleware.js';

const router = Router();

router.post('/login', validate(loginSchema), login);
router.get('/profile', authenticateJWT, getProfile);

export default router;
