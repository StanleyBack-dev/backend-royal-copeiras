import { Injectable } from "@nestjs/common";
import { RefreshSessionService } from "../../sessions/services/refresh/refresh-session.service";
import { SaveSessionService } from "../../sessions/services/save/save-session.service";
import { ValidateSessionService } from "../../sessions/services/validate/validate-session.service";
import { AppException } from "../../../common/exceptions/app-exception";
import { APP_ERRORS } from "../../../common/exceptions/app-errors.catalog";
import { AuthSessionResponseDto } from "../dtos/session/auth-session-response.dto";
import { AuthCredentialsService } from "./auth-credentials.service";
import { AuthTokensService } from "./auth-tokens.service";

@Injectable()
export class RefreshAuthSessionService {
  constructor(
    private readonly validateSessionService: ValidateSessionService,
    private readonly refreshSessionService: RefreshSessionService,
    private readonly saveSessionService: SaveSessionService,
    private readonly authTokensService: AuthTokensService,
    private readonly authCredentialsService: AuthCredentialsService,
  ) {}

  async execute(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    response: AuthSessionResponseDto;
  }> {
    const payload = this.authTokensService.verifyRefreshToken(refreshToken);
    const session = await this.validateSessionService.execute(
      refreshToken,
      payload.uid,
    );

    if (!session) {
      throw AppException.from(
        APP_ERRORS.auth.invalidOrRevokedSession,
        undefined,
      );
    }

    await this.refreshSessionService.execute(session);

    const credential = await this.authCredentialsService.findByUserId(
      payload.uid,
    );
    if (!credential) {
      throw AppException.from(
        APP_ERRORS.auth.credentialMissingForRefresh,
        undefined,
      );
    }

    const nextAccessToken = this.authTokensService.signAccessToken(
      credential.user,
      credential.username,
    );
    const nextRefreshToken = this.authTokensService.signRefreshToken(
      credential.user,
      credential.username,
    );

    session.refreshToken = nextRefreshToken;
    session.refreshTokenExpiresAt = new Date(
      Date.now() + this.authTokensService.getRefreshTokenMaxAgeMs(),
    );
    session.lastUsedAt = new Date();

    await this.saveSessionService.execute(session);

    return {
      accessToken: nextAccessToken,
      refreshToken: nextRefreshToken,
      response: {
        authenticated: true,
        mustChangePassword: credential.mustChangePassword,
        user: {
          idUsers: credential.user.idUsers,
          name: credential.user.name,
          email: credential.user.email,
          username: credential.username,
          group: credential.user.group,
          status: credential.user.status,
          urlAvatar: credential.user.urlAvatar,
        },
      },
    };
  }
}
