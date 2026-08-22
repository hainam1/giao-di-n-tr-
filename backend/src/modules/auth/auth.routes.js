import { Router } from 'express';
import { login, getProfile, register, updateProfile, oauthAuthorize, oauthCallback, refresh, logout, listAddresses, createAddress, updateAddress, deleteAddress } from './auth.controller.js';
import { loginSchema, registerSchema, updateProfileSchema, refreshTokenSchema, logoutSchema, createAddressSchema, updateAddressSchema, addressIdSchema } from './auth.validation.js';
import { validate } from '../../core/validateMiddleware.js';
import { authenticateJWT } from '../../core/authMiddleware.js';

const router = Router();

router.post('/login', validate(loginSchema), login);
router.post('/register', validate(registerSchema), register);
router.post('/refresh', validate(refreshTokenSchema), refresh);
router.post('/logout', validate(logoutSchema), logout);
router.get('/oauth/:provider', oauthAuthorize);
router.get('/oauth/:provider/callback', oauthCallback);
router.get('/profile', authenticateJWT, getProfile);
router.put('/profile', authenticateJWT, validate(updateProfileSchema), updateProfile);
router.get('/addresses', authenticateJWT, listAddresses);
router.post('/addresses', authenticateJWT, validate(createAddressSchema), createAddress);
router.put('/addresses/:id', authenticateJWT, validate(updateAddressSchema), updateAddress);
router.delete('/addresses/:id', authenticateJWT, validate(addressIdSchema), deleteAddress);

export default router;
