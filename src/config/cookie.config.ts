import { CookieOptions } from "express";
import { isDeployedEnv } from "./environment.util";

const IS_DEPLOYED = isDeployedEnv();
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || undefined;

export const ACCESS_TOKEN_COOKIE_NAME = "accessToken";
export const REFRESH_TOKEN_COOKIE_NAME = "refreshToken";

function buildBaseCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: IS_DEPLOYED,
    sameSite: IS_DEPLOYED ? "none" : "lax",
    path: "/",
    domain: COOKIE_DOMAIN,
  };
}

export function buildAccessTokenCookieOptions(maxAge: number): CookieOptions {
  return {
    ...buildBaseCookieOptions(),
    maxAge,
  };
}

export function buildRefreshTokenCookieOptions(maxAge: number): CookieOptions {
  return {
    ...buildBaseCookieOptions(),
    maxAge,
  };
}

export function buildCookieClearOptions(): CookieOptions {
  return buildBaseCookieOptions();
}
