import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthGuard } from "../../common/guards/auth.guards";
import { SessionsModule } from "../sessions/sessions.module";
import { UserEntity } from "../users/entities/user.entity";
import { AuthResolver } from "./resolvers/auth.resolver";
import { AuthPermissionsGuard } from "./guards/auth-permissions.guard";
import { FirstAccessGuard } from "./guards/first-access.guard";
import { AuthCredentialEntity } from "./entities/auth-credential.entity";
import { AuthCookieService } from "./services/auth-cookie.service";
import { AuthCredentialsService } from "./services/auth-credentials.service";
import { AuthTokensService } from "./services/auth-tokens.service";
import { AuthorizationService } from "./services/authorization.service";
import { ChangePasswordService } from "./services/change-password.service";
import { LoginService } from "./services/login.service";
import { LogoutService } from "./services/logout.service";
import { PasswordHasherService } from "./services/password-hasher.service";
import { ProvisionAuthCredentialsService } from "./services/provision-auth-credentials.service";
import { RefreshAuthSessionService } from "./services/refresh-auth-session.service";
import { AuthBootstrapService } from "./services/auth-bootstrap.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([AuthCredentialEntity, UserEntity]),
    SessionsModule,
  ],
  providers: [
    AuthResolver,
    AuthBootstrapService,
    AuthorizationService,
    AuthCookieService,
    AuthCredentialsService,
    AuthTokensService,
    ChangePasswordService,
    LoginService,
    LogoutService,
    PasswordHasherService,
    ProvisionAuthCredentialsService,
    RefreshAuthSessionService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AuthPermissionsGuard,
    },
    {
      provide: APP_GUARD,
      useClass: FirstAccessGuard,
    },
  ],
  exports: [
    AuthCredentialsService,
    AuthTokensService,
    AuthorizationService,
    PasswordHasherService,
    ProvisionAuthCredentialsService,
  ],
})
export class AuthModule {}
