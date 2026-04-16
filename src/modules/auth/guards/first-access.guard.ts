import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { GqlExecutionContext } from "@nestjs/graphql";
import { IS_PUBLIC_KEY } from "../../../common/decorators/public.decorator";
import { ALLOW_FIRST_ACCESS_KEY } from "../decorators/allow-first-access.decorator";
import { AuthCredentialsService } from "../services/auth-credentials.service";

@Injectable()
export class FirstAccessGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authCredentialsService: AuthCredentialsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const allowFirstAccess = this.reflector.getAllAndOverride<boolean>(
      ALLOW_FIRST_ACCESS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (allowFirstAccess) {
      return true;
    }

    const request = this.getRequest(context);
    const currentUser = request.user as { idUsers?: string } | undefined;

    if (!currentUser?.idUsers) {
      return true;
    }

    const credential = await this.authCredentialsService.findByUserId(
      currentUser.idUsers,
    );

    if (!credential?.mustChangePassword) {
      return true;
    }

    throw new ForbiddenException(
      "Primeiro acesso pendente. Altere sua senha para continuar.",
    );
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
