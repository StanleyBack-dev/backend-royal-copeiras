import { Injectable } from "@nestjs/common";
import { CreateSessionService } from "../../sessions/services/create/create-session.service";
import { AppException } from "../../../common/exceptions/app-exception";
import { APP_ERRORS } from "../../../common/exceptions/app-errors.catalog";
import { LoginInputDto } from "../dtos/login/login-input.dto";
import { AuthSessionResponseDto } from "../dtos/session/auth-session-response.dto";
import { AuthCredentialsService } from "./auth-credentials.service";
import { AuthTokensService } from "./auth-tokens.service";
import { PasswordHasherService } from "./password-hasher.service";

interface SessionRequestInfo {
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class LoginService {
  constructor(
    private readonly authCredentialsService: AuthCredentialsService,
    private readonly passwordHasherService: PasswordHasherService,
    private readonly authTokensService: AuthTokensService,
    private readonly createSessionService: CreateSessionService,
  ) {}

  async execute(
    input: LoginInputDto,
    requestInfo: SessionRequestInfo,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    response: AuthSessionResponseDto;
  }> {
    const credential = await this.authCredentialsService.findByUsername(
      input.username,
    );

    if (!credential) {
      throw AppException.from(APP_ERRORS.auth.invalidCredentials, undefined);
    }

    await this.authCredentialsService.ensureCredentialCanAuthenticate(
      credential,
    );

    const passwordMatches = await this.passwordHasherService.verifyPassword(
      input.password,
      credential.passwordHash,
    );

    if (!passwordMatches) {
      await this.authCredentialsService.registerFailedLogin(credential);
      throw AppException.from(APP_ERRORS.auth.invalidCredentials, undefined);
    }

    const accessToken = this.authTokensService.signAccessToken(
      credential.user,
      credential.username,
    );
    const refreshToken = this.authTokensService.signRefreshToken(
      credential.user,
      credential.username,
    );

    await this.createSessionService.execute({
      idUsers: credential.idUsers,
      refreshToken,
      ipAddress: requestInfo.ipAddress,
      userAgent: requestInfo.userAgent,
      refreshTokenExpiresAt: new Date(
        Date.now() + this.authTokensService.getRefreshTokenMaxAgeMs(),
      ),
      lastUsedAt: new Date(),
      sessionActive: true,
    });

    await this.authCredentialsService.registerSuccessfulLogin(credential);

    return {
      accessToken,
      refreshToken,
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
