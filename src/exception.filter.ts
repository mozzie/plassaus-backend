import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
} from '@nestjs/common';
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';
import { ServerResponse } from 'http';

@Catch(EntityNotFoundError)
class EntityNotFoundFilter implements ExceptionFilter {
  errorMessage = 'Entity not found.';

  catch(_: EntityNotFoundError, host: ArgumentsHost) : void {
    const response : ServerResponse = host.switchToHttp().getResponse<ServerResponse>();
    response.statusCode = 404;
    response.statusMessage = this.errorMessage;
    response.end();
  }
}

export default EntityNotFoundFilter;
