/**
 * WeldsController — REST API для реестра сварных соединений
 *
 * Endpoints:
 * - GET    /api/welds      — список соединений (с опциональным ?search=)
 * - GET    /api/welds/:id  — получение по ID
 * - POST   /api/welds      — создание
 * - PATCH  /api/welds/:id  — обновление
 * - DELETE /api/welds/:id  — удаление
 *
 * @see https://docs.nestjs.com/controllers — NestJS Controllers
 * @see https://docs.nestjs.com/techniques/validation — Request Validation
 */

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import { WeldsService } from './welds.service';
import { CreateWeldDto } from './dto/create-weld.dto';
import { UpdateWeldDto } from './dto/update-weld.dto';

/**
 * Контроллер API для работы с реестром сварных соединений (welds)
 *
 * Базовый путь: /api/welds (с учётом глобального префикса /api)
 */
@Controller('welds')
export class WeldsController {
  constructor(private readonly weldsService: WeldsService) {}

  /**
   * POST /api/welds — создание нового сварного соединения
   *
   * @param createWeldDto - тело запроса с данными соединения
   * @returns созданное соединение
   *
   * @example
   * curl -X POST http://localhost:3000/api/welds \
   *   -H "Content-Type: application/json" \
   *   -d '{"weldNumber":"ШС-001","diameter":219,"thickness1":8,"qualityLevel":"B"}'
   */
  @Post()
  create(@Body() createWeldDto: CreateWeldDto) {
    return this.weldsService.create(createWeldDto);
  }

  /**
   * GET /api/welds — получение списка сварных соединений
   *
   * @param search - опциональный поиск по номеру стыка (weldNumber)
   * @param objectName - опциональная фильтрация по названию объекта строительства
   * @returns массив соединений
   *
   * @example
   * curl http://localhost:3000/api/welds
   * curl http://localhost:3000/api/welds?search=ШС-001
   * curl http://localhost:3000/api/welds?objectName=Газопровод
   */
  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('objectName') objectName?: string
  ) {
    return this.weldsService.findAll(search, objectName);
  }

  /**
   * GET /api/welds/:id — получение соединения по ID
   *
   * @param id - MongoDB ObjectId
   * @returns найденное соединение или 404
   *
   * @example
   * curl http://localhost:3000/api/welds/507f1f77bcf86cd799439011
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.weldsService.findOne(id);
  }

  /**
   * PATCH /api/welds/:id — обновление соединения
   *
   * @param id - MongoDB ObjectId
   * @param updateWeldDto - поля для обновления
   * @returns обновлённое соединение или 404
   *
   * @example
   * curl -X PATCH http://localhost:3000/api/welds/507f1f77bcf86cd799439011 \
   *   -H "Content-Type: application/json" \
   *   -d '{"conclusion":"OK"}'
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWeldDto: UpdateWeldDto) {
    return this.weldsService.update(id, updateWeldDto);
  }

  /**
   * DELETE /api/welds/:id — удаление соединения
   *
   * @param id - MongoDB ObjectId
   * @returns 204 No Content или 404
   *
   * @example
   * curl -X DELETE http://localhost:3000/api/welds/507f1f77bcf86cd799439011
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.weldsService.remove(id);
  }
}
