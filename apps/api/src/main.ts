/**
 * NestJS API Server Entry Point
 *
 * Настройки:
 * - Глобальный префикс: /api
 * - ValidationPipe: валидация DTO с whitelist и transform
 * - CORS: включён для разработки
 *
 * @see https://docs.nestjs.com/first-steps — NestJS Bootstrap
 * @see https://docs.nestjs.com/techniques/validation#using-the-built-in-validationpipe — ValidationPipe
 */

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  /**
   * Глобальный префикс API
   * Все роуты будут доступны по /api/*
   */
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  /**
   * Глобальный ValidationPipe
   *
   * - whitelist: true — удаляет поля, не описанные в DTO
   * - transform: true — автоматически преобразует типы (string → number)
   * - forbidNonWhitelisted: false — не бросает ошибку для лишних полей (просто удаляет)
   *
   * @see https://docs.nestjs.com/techniques/validation#stripping-properties
   */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    })
  );

  /**
   * CORS для локальной разработки
   * Разрешает запросы с Angular dev server (localhost:4200)
   *
   * @see https://docs.nestjs.com/security/cors
   */
  app.enableCors();

  const port = process.env['PORT'] || 3333;
  await app.listen(port);

  Logger.log(
    `🚀 API сервер запущен: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
