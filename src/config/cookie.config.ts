import { CookieOptions } from 'express';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

export const REFRESH_TOKEN_COOKIE_NAME = 'refreshToken';

export const REFRESH_TOKEN_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: IS_PRODUCTION,
  sameSite: 'none',
  path: '/',
  domain: '.fitpulseio.com.br',
  maxAge: 30 * 24 * 60 * 60 * 1000,
};