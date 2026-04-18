import { Resolver, Mutation, Args, Context } from "@nestjs/graphql";
import { Request, Response } from "express";
import { Public } from "../../../common/decorators/public.decorator";
import { CurrentUser } from "../../../common/decorators/current-user.decorator";
import { RESPONSE_MESSAGES } from "../../../common/responses/catalogs/response-messages.catalog";
import { buildDataResponse } from "../../../common/responses/helpers/response.helper";
import { buildSuccessResponse } from "../../../common/responses/helpers/response.helper";
import { AllowFirstAccess } from "../decorators/allow-first-access.decorator";
import { RequirePermissions } from "../decorators/require-permissions.decorator";
import { REFRESH_TOKEN_COOKIE_NAME } from "../../../config/cookie.config";
import { AuthPermission } from "../enums/auth-permission.enum";
import { ChangePasswordInputDto } from "../dtos/password/change-password-input.dto";
import { LoginInputDto } from "../dtos/login/login-input.dto";
import { LogoutResponseDto } from "../dtos/logout/logout-response.dto";
import { RequestPasswordRecoveryInputDto } from "../dtos/password-recovery/request-password-recovery-input.dto";
import { ResetPasswordWithRecoveryInputDto } from "../dtos/password-recovery/reset-password-with-recovery-input.dto";
import { AuthSessionResponseDto } from "../dtos/session/auth-session-response.dto";
import { VerifyPasswordRecoveryCodeInputDto } from "../dtos/password-recovery/verify-password-recovery-code-input.dto";
import { VerifyPasswordRecoveryCodeMutationResponseDto } from "../dtos/password-recovery/verify-password-recovery-code-mutation-response.dto";
import type { AuthenticatedUser } from "../interfaces/auth-token-payload.interface";
import { AuthCookieService } from "../services/auth-cookie.service";
import { ChangePasswordService } from "../services/change-password.service";
import { LoginService } from "../services/login.service";
import { LogoutService } from "../services/logout.service";
import { RequestPasswordRecoveryService } from "../services/password-recovery/request-password-recovery.service";
import { ResetPasswordWithRecoveryService } from "../services/password-recovery/reset-password-with-recovery.service";
import { VerifyPasswordRecoveryCodeService } from "../services/password-recovery/verify-password-recovery-code.service";
import { RefreshAuthSessionService } from "../services/refresh-auth-session.service";

interface GraphqlContext {
  req: Request;
  res: Response;
}

interface RequestInfo {
  ipAddress?: string;
  userAgent?: string;
}

@Resolver()
export class AuthResolver {
  constructor(
    private readonly loginService: LoginService,
    private readonly refreshAuthSessionService: RefreshAuthSessionService,
    private readonly logoutService: LogoutService,
    private readonly changePasswordService: ChangePasswordService,
    private readonly requestPasswordRecoveryService: RequestPasswordRecoveryService,
    private readonly verifyPasswordRecoveryCodeService: VerifyPasswordRecoveryCodeService,
    private readonly resetPasswordWithRecoveryService: ResetPasswordWithRecoveryService,
    private readonly authCookieService: AuthCookieService,
  ) {}

  @Public()
  @Mutation(() => AuthSessionResponseDto, { name: "login" })
  async login(
    @Args("input") input: LoginInputDto,
    @Context() context: GraphqlContext,
  ): Promise<AuthSessionResponseDto> {
    const { accessToken, refreshToken, response } =
      await this.loginService.execute(
        input,
        this.extractRequestInfo(context.req),
      );

    this.authCookieService.setAuthCookies(
      context.res,
      accessToken,
      refreshToken,
    );

    return response;
  }

  @Public()
  @Mutation(() => AuthSessionResponseDto, { name: "refreshAuthSession" })
  async refreshAuthSession(
    @Context() context: GraphqlContext,
  ): Promise<AuthSessionResponseDto> {
    const refreshToken = context.req.cookies?.[REFRESH_TOKEN_COOKIE_NAME] as
      | string
      | undefined;

    const {
      accessToken,
      refreshToken: nextRefreshToken,
      response,
    } = await this.refreshAuthSessionService.execute(refreshToken ?? "");

    this.authCookieService.setAuthCookies(
      context.res,
      accessToken,
      nextRefreshToken,
    );

    return response;
  }

  @Mutation(() => LogoutResponseDto, { name: "logout" })
  @AllowFirstAccess()
  @RequirePermissions(AuthPermission.LOGOUT)
  async logout(@Context() context: GraphqlContext): Promise<LogoutResponseDto> {
    const refreshToken = context.req.cookies?.[REFRESH_TOKEN_COOKIE_NAME] as
      | string
      | undefined;

    await this.logoutService.execute(refreshToken);
    this.authCookieService.clearAuthCookies(context.res);

    return buildSuccessResponse(
      RESPONSE_MESSAGES.auth.logout,
    ) as LogoutResponseDto;
  }

  @Mutation(() => LogoutResponseDto, { name: "changeMyPassword" })
  @AllowFirstAccess()
  @RequirePermissions(AuthPermission.CHANGE_OWN_PASSWORD)
  async changeMyPassword(
    @CurrentUser() user: AuthenticatedUser,
    @Args("input") input: ChangePasswordInputDto,
  ): Promise<LogoutResponseDto> {
    await this.changePasswordService.execute(user.idUsers, input);

    return buildSuccessResponse(
      RESPONSE_MESSAGES.auth.passwordChanged,
    ) as LogoutResponseDto;
  }

  @Public()
  @Mutation(() => LogoutResponseDto, { name: "requestPasswordRecovery" })
  async requestPasswordRecovery(
    @Args("input") input: RequestPasswordRecoveryInputDto,
  ): Promise<LogoutResponseDto> {
    await this.requestPasswordRecoveryService.execute(input.email);

    return buildSuccessResponse(
      RESPONSE_MESSAGES.auth.passwordRecoveryRequested,
    ) as LogoutResponseDto;
  }

  @Public()
  @Mutation(() => VerifyPasswordRecoveryCodeMutationResponseDto, {
    name: "verifyPasswordRecoveryCode",
  })
  async verifyPasswordRecoveryCode(
    @Args("input") input: VerifyPasswordRecoveryCodeInputDto,
  ) {
    const result = await this.verifyPasswordRecoveryCodeService.execute(
      input.email,
      input.code,
    );

    return buildDataResponse(
      result,
      RESPONSE_MESSAGES.auth.passwordRecoveryCodeValidated,
    );
  }

  @Public()
  @Mutation(() => LogoutResponseDto, { name: "resetPasswordWithRecovery" })
  async resetPasswordWithRecovery(
    @Args("input") input: ResetPasswordWithRecoveryInputDto,
  ): Promise<LogoutResponseDto> {
    await this.resetPasswordWithRecoveryService.execute(
      input.recoveryToken,
      input.newPassword,
    );

    return buildSuccessResponse(
      RESPONSE_MESSAGES.auth.passwordRecovered,
    ) as LogoutResponseDto;
  }

  private extractRequestInfo(request: Request): RequestInfo {
    const forwardedFor = request.headers["x-forwarded-for"];
    const ipAddress = Array.isArray(forwardedFor)
      ? forwardedFor[0]
      : (forwardedFor?.split(",")[0]?.trim() ?? request.socket.remoteAddress);

    return {
      ipAddress,
      userAgent: request.headers["user-agent"] ?? undefined,
    };
  }
}
