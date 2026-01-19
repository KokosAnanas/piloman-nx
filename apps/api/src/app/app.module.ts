/**
 * AppModule — корневой модуль NestJS приложения
 *
 * Подключает:
 * - ConfigModule для работы с переменными окружения
 * - MongooseModule для подключения к MongoDB
 * - WeldsModule — домен "Реестр сварных соединений"
 *
 * @see https://docs.nestjs.com/modules — NestJS Modules
 * @see https://docs.nestjs.com/techniques/configuration — ConfigModule
 * @see https://docs.nestjs.com/techniques/mongodb — MongoDB
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WeldsModule } from './welds/welds.module';

@Module({
  imports: [
    /**
     * ConfigModule — загрузка переменных окружения из .env
     * isGlobal: true — доступен во всех модулях без повторного импорта
     *
     * @see https://docs.nestjs.com/techniques/configuration#use-module-globally
     */
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    /**
     * MongooseModule — подключение к MongoDB
     *
     * Использует MONGODB_URI из .env или fallback на localhost.
     * Подключение по умолчанию: mongodb://localhost:27017/piloman
     *
     * @see https://docs.nestjs.com/techniques/mongodb#async-configuration
     */
    MongooseModule.forRoot(
      process.env['MONGODB_URI'] || 'mongodb://localhost:27017/piloman'
    ),

    /**
     * WeldsModule — домен "Реестр сварных соединений"
     * Включает CRUD API и Mongoose модель
     */
    WeldsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
