import { BadRequestException, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { isUUID } from 'class-validator';

// TEMPORÁRIO: enquanto a auth (BACK-04) não está na dev, o id do usuário vem no header x-user-id.
// quando a auth entrar, trocar para o id do token (request.user.sub) — as rotas não mudam.
export const RequestUserId = createParamDecorator((_data: unknown, context: ExecutionContext) => {
  const userId = context.switchToHttp().getRequest().headers['x-user-id'];

  if (typeof userId !== 'string' || !isUUID(userId)) {
    throw new BadRequestException('Informe o id do usuário no header x-user-id.');
  }

  return userId;
});
