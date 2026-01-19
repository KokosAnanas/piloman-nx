/**
 * WeldsModule — NestJS модуль для домена "Реестр сварных соединений"
 *
 * Регистрирует:
 * - Mongoose схему Weld
 * - WeldsController (REST endpoints)
 * - WeldsService (бизнес-логика)
 *
 * Этот модуль подключается в AppModule.
 *
 * @see https://docs.nestjs.com/modules — NestJS Modules
 * @see https://docs.nestjs.com/techniques/mongodb#model-injection — Mongoose Feature
 */

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Weld, WeldSchema } from './schemas/weld.schema';
import { WeldsController } from './welds.controller';
import { WeldsService } from './welds.service';

@Module({
  imports: [
    /**
     * Регистрация Mongoose модели для Weld
     * Создаёт провайдер для инжекции через @InjectModel(Weld.name)
     *
     * @see https://docs.nestjs.com/techniques/mongodb#model-injection
     */
    MongooseModule.forFeature([{ name: Weld.name, schema: WeldSchema }]),
  ],
  controllers: [WeldsController],
  providers: [WeldsService],
  exports: [WeldsService], // Экспортируем, если понадобится в других модулях
})
export class WeldsModule {}
