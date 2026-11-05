import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Role } from '@prisma/client';

// dados do token anexados na requisição pelo AuthGuard
export interface JwtPayload {
  sub: string;
  role: Role;
}

//retorna o usuário logado; só funciona em rotas protegidas pelo AuthGuard
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): JwtPayload => {
    return context.switchToHttp().getRequest().user;
  },
);
