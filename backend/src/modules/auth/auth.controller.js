import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { successResponse } from '../../core/responseHandler.js';
import { AppError } from '../../core/errorHandler.js';
import { config } from '../../config/app.config.js';
import { authService } from './auth.service.js';
import { oauthService } from './oauth.service.js';
import { addressService } from './address.service.js';

const requestMetadata = (req) => ({
  device: req.body.device || null,
  ipAddress: req.ip || req.socket?.remoteAddress || null,
  userAgent: req.get('user-agent') || null,
});

const oauthCookieName = 'oauth_state_nonce';
const cookieOptions = () => `HttpOnly; SameSite=Lax; Max-Age=600; Path=/api/v1/auth/oauth${config.env === 'production' ? '; Secure' : ''}`;
const readCookie = (req, name) => Object.fromEntries(
  String(req.headers.cookie || '').split(';').map((part) => {
    const [key, ...value] = part.trim().split('=');
    return [key, decodeURIComponent(value.join('='))];
  }).filter(([key]) => key),
)[name];
const oauthRedirect = (res, params) => {
  const fragment = new URLSearchParams(params);
  return res.redirect(`${config.frontendAuthUrl}#${fragment}`);
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await authService.login(email, password, requestMetadata(req));

    return successResponse(res, {
      message: 'Đăng nhập thành công',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    return successResponse(res, {
      message: 'Lấy thông tin người dùng thành công',
      data: { user: await authService.getProfile(req.user.id) },
    });
  } catch (err) {
    next(err);
  }
};

export const register = async (req, res, next) => {
  try {
    return successResponse(res, {
      statusCode: 201,
      message: 'Đăng ký thành công',
      data: await authService.register(req.body),
    });
  } catch (err) { next(err); }
};

export const updateProfile = async (req, res, next) => {
  try {
    return successResponse(res, {
      message: 'Cập nhật hồ sơ thành công',
      data: { user: await authService.updateProfile(req.user.id, req.body) },
    });
  } catch (err) { next(err); }
};

export const refresh = async (req, res, next) => {
  try {
    return successResponse(res, {
      message: 'Làm mới phiên đăng nhập thành công',
      data: await authService.refresh(req.body.refreshToken, requestMetadata(req)),
    });
  } catch (err) { next(err); }
};

export const logout = async (req, res, next) => {
  try {
    await authService.logout(req.body.refreshToken);
    return successResponse(res, { message: 'Đăng xuất thành công' });
  } catch (err) { next(err); }
};

export const listAddresses = async (req, res, next) => {
  try { return successResponse(res, { data: await addressService.list(req.user.id) }); } catch (err) { next(err); }
};
export const createAddress = async (req, res, next) => {
  try { return successResponse(res, { statusCode: 201, data: await addressService.create(req.user.id, req.body) }); } catch (err) { next(err); }
};
export const updateAddress = async (req, res, next) => {
  try { return successResponse(res, { data: await addressService.update(req.user.id, req.params.id, req.body) }); } catch (err) { next(err); }
};
export const deleteAddress = async (req, res, next) => {
  try {
    await addressService.delete(req.user.id, req.params.id);
    return successResponse(res, { message: 'Đã xóa địa chỉ' });
  } catch (err) { next(err); }
};

export const oauthAuthorize = async (req, res, next) => {
  try {
    const provider = req.params.provider.toLowerCase();
    const nonce = crypto.randomBytes(32).toString('hex');
    const state = jwt.sign({ provider, nonce, purpose: 'oauth_state' }, config.jwt.secret, { expiresIn: '10m' });
    res.setHeader('Set-Cookie', `${oauthCookieName}=${encodeURIComponent(nonce)}; ${cookieOptions()}`);
    return res.redirect(oauthService.authorizationUrl(provider, state));
  } catch (err) { next(err); }
};

export const oauthCallback = async (req, res) => {
  const clearCookie = `${oauthCookieName}=; HttpOnly; SameSite=Lax; Max-Age=0; Path=/api/v1/auth/oauth${config.env === 'production' ? '; Secure' : ''}`;
  res.setHeader('Set-Cookie', clearCookie);
  try {
    if (req.query.error) throw new AppError('Bạn đã hủy hoặc từ chối đăng nhập OAuth', 401);
    if (!req.query.code || !req.query.state) throw new AppError('OAuth callback thiếu mã xác thực', 400);
    const state = jwt.verify(req.query.state, config.jwt.secret);
    const provider = req.params.provider.toLowerCase();
    const cookieNonce = readCookie(req, oauthCookieName);
    if (state.purpose !== 'oauth_state' || state.provider !== provider || !cookieNonce || state.nonce !== cookieNonce) {
      throw new AppError('OAuth state không hợp lệ hoặc đã hết hạn', 401);
    }
    const token = await oauthService.authenticate(provider, req.query.code);
    return oauthRedirect(res, { oauth_token: token });
  } catch (err) {
    return oauthRedirect(res, { oauth_error: err.message || 'Đăng nhập OAuth thất bại' });
  }
};
