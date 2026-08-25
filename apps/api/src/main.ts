import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import type { NextFunction, Response } from 'express';

import { AppModule } from './app.module';
import { requestIdFromHeader } from './audit/audit-context';
import type { AuthenticatedRequest } from './authorization/types/authenticated-request.type';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.use(cookieParser());
  app.use((request: AuthenticatedRequest, response: Response, next: NextFunction) => {
    const requestId = requestIdFromHeader(request.header('x-request-id'));
    request.requestId = requestId;
    response.setHeader('x-request-id', requestId);
    next();
  });
  app.enableCors({
    origin: config.get<string>('WEB_ORIGIN', 'http://localhost:5174'),
    credentials: true,
  });
  app.setGlobalPrefix('api');
  app.enableShutdownHooks();
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(config.get<number>('PORT', 3002));
}

void bootstrap();
