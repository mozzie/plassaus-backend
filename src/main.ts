import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import AppModule from './app.module';
import ExceptionFilter from './exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new ExceptionFilter());
  await app.listen(3000);
}
bootstrap().catch(() => Logger.error('Server failed to start, exiting.'));
