import jwt from 'jsonwebtoken';
import prisma from '../../database/prismaClient.js';
import { config } from '../../config/app.config.js';
import { AppError } from '../../core/errorHandler.js';

const callbackUrl = (provider) => `${config.backendUrl}/api/v1/auth/oauth/${provider}/callback`;

const providers = {
  google: {
    authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scope: 'openid email profile',
    credentials: config.oauth.google,
  },
  facebook: {
    authorizeUrl: `https://www.facebook.com/${config.oauth.facebook.graphVersion}/dialog/oauth`,
    tokenUrl: `https://graph.facebook.com/${config.oauth.facebook.graphVersion}/oauth/access_token`,
    scope: 'email,public_profile',
    credentials: config.oauth.facebook,
  },
};

const providerConfig = (provider) => {
  const selected = providers[provider];
  if (!selected) throw new AppError('Nhà cung cấp OAuth không được hỗ trợ', 404);
  if (!selected.credentials.clientId || !selected.credentials.clientSecret) {
    throw new AppError(`OAuth ${provider} chưa được cấu hình trên máy chủ`, 503);
  }
  return selected;
};

const fetchJson = async (url, options) => {
  const response = await fetch(url, options);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.error) {
    const message = payload.error_description || payload.error?.message || 'Nhà cung cấp OAuth từ chối yêu cầu';
    throw new AppError(message, 401);
  }
  return payload;
};

export const oauthService = {
  authorizationUrl(provider, state) {
    const selected = providerConfig(provider);
    const params = new URLSearchParams({
      client_id: selected.credentials.clientId,
      redirect_uri: callbackUrl(provider),
      response_type: 'code',
      scope: selected.scope,
      state,
    });
    if (provider === 'google') {
      params.set('access_type', 'offline');
      params.set('include_granted_scopes', 'true');
    }
    return `${selected.authorizeUrl}?${params}`;
  },

  async authenticate(provider, code) {
    const selected = providerConfig(provider);
    const tokenParams = new URLSearchParams({
      client_id: selected.credentials.clientId,
      client_secret: selected.credentials.clientSecret,
      redirect_uri: callbackUrl(provider),
      code,
      grant_type: 'authorization_code',
    });
    const token = await fetchJson(selected.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tokenParams,
    });

    let profile;
    if (provider === 'google') {
      profile = await fetchJson('https://openidconnect.googleapis.com/v1/userinfo', {
        headers: { Authorization: `Bearer ${token.access_token}` },
      });
      if (!profile.email_verified) throw new AppError('Email Google chưa được xác minh', 401);
    } else {
      const url = new URL(`https://graph.facebook.com/${config.oauth.facebook.graphVersion}/me`);
      url.searchParams.set('fields', 'id,name,email,picture');
      url.searchParams.set('access_token', token.access_token);
      profile = await fetchJson(url);
    }

    if (!profile.id && !profile.sub) throw new AppError('Không nhận được mã tài khoản OAuth', 401);
    if (!profile.email) throw new AppError('Tài khoản OAuth chưa cấp quyền truy cập email', 401);

    const providerAccountId = String(profile.sub || profile.id);
    const email = profile.email.toLowerCase();
    const expiresAt = token.expires_in ? new Date(Date.now() + Number(token.expires_in) * 1000) : null;
    const existingAccount = await prisma.oAuthAccount.findUnique({
      where: { provider_providerAccountId: { provider, providerAccountId } },
      include: { user: true },
    });

    let user;
    if (existingAccount) {
      user = existingAccount.user;
      await prisma.oAuthAccount.update({
        where: { id: existingAccount.id },
        data: {
          accessToken: token.access_token,
          refreshToken: token.refresh_token || existingAccount.refreshToken,
          tokenExpiresAt: expiresAt,
        },
      });
    } else {
      user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        throw new AppError('Email này chưa đăng ký. Vui lòng đăng ký và đồng ý điều khoản trước khi liên kết OAuth.', 409);
      }
      await prisma.oAuthAccount.create({ data: {
        userId: user.id,
        provider,
        providerAccountId,
        accessToken: token.access_token,
        refreshToken: token.refresh_token || null,
        tokenExpiresAt: expiresAt,
      } });
    }

    if (user.status !== 'ACTIVE') throw new AppError('Tài khoản đã bị khóa', 403);
    const loggedInAt = new Date();
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: loggedInAt, avatarUrl: user.avatarUrl || profile.picture?.data?.url || profile.picture || null },
    });
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name, type: 'access' },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn },
    );
  },
};
