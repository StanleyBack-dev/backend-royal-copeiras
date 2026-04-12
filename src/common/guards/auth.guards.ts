import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
// import { REFRESH_TOKEN_COOKIE_NAME } from '../../config/cookie.config'; 

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Verifica se a rota é pública
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    // 2. Detecta o contexto (GraphQL ou HTTP)
    // const request = this.getRequest(context);

    // --- ESTRATÉGIA DE VALIDAÇÃO HÍBRIDA ---

    // CENÁRIO A/B: Não há mais autenticação implementada
    // Sempre lança Forbidden
    throw new ForbiddenException('Token não informado.');
  }

  // Método auxiliar mantido (está correto)
  private getRequest(context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context);
    const gqlReq = gqlContext.getContext()?.req;
    if (gqlReq) return gqlReq;
    return context.switchToHttp().getRequest();
  }
}