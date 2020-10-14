import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import JwtUser from './jwtuser.entity';
import IncomingWithUser from './incomingwithuser.entity';

const AuthUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) : JwtUser => {
    const request : IncomingWithUser = ctx.switchToHttp().getRequest<IncomingWithUser>();
    return request.user;
  },
);

export default AuthUser;
