import { Injectable } from "@nestjs/common";
import { Response } from "express";
import {
  ACCESS_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
  buildAccessTokenCookieOptions,
  buildCookieClearOptions,
  buildRefreshTokenCookieOptions,
} from "../../../config/cookie.config";
import { AuthTokensService } from "./auth-tokens.service";

@Injectable()
export class AuthCookieService {
  constructor(private readonly authTokensService: AuthTokensService) {}

  setAuthCookies(
    response: Response,
    accessToken: string,
    refreshToken: string,
  ): void {
    response.cookie(
      ACCESS_TOKEN_COOKIE_NAME,
      accessToken,
      buildAccessTokenCookieOptions(
        this.authTokensService.getAccessTokenMaxAgeMs(),
      ),
    );
    response.cookie(
      REFRESH_TOKEN_COOKIE_NAME,
      refreshToken,
      buildRefreshTokenCookieOptions(
        this.authTokensService.getRefreshTokenMaxAgeMs(),
      ),
    );
  }

  clearAuthCookies(response: Response): void {
    const clearOptions = buildCookieClearOptions();
    response.clearCookie(ACCESS_TOKEN_COOKIE_NAME, clearOptions);
    response.clearCookie(REFRESH_TOKEN_COOKIE_NAME, clearOptions);
  }
}
