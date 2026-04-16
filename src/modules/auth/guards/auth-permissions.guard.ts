import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { GqlExecutionContext } from "@nestjs/graphql";
import { AUTH_PERMISSIONS_KEY } from "../decorators/require-permissions.decorator";
import { AuthPermission } from "../enums/auth-permission.enum";
import { AuthenticatedUser } from "../interfaces/auth-token-payload.interface";
import { AuthorizationService } from "../services/authorization.service";

@Injectable()
export class AuthPermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authorizationService: AuthorizationService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const permissions = this.reflector.getAllAndOverride<AuthPermission[]>(
      AUTH_PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!permissions?.length) {
      return true;
    }

    const request = this.getRequest(context);
    const user = request.user as AuthenticatedUser | undefined;

    if (!user) {
      throw new UnauthorizedException("Usuário não autenticado.");
    }

    this.authorizationService.assertPermissionsForGroup(
      user.group,
      permissions,
    );
    return true;
  }

  private getRequest(context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context);
    const gqlReq = gqlContext.getContext()?.req;
    if (gqlReq) {
      return gqlReq as Record<string, unknown> & { user?: unknown };
    }

    return context
      .switchToHttp()
      .getRequest<Record<string, unknown> & { user?: unknown }>();
  }
}
