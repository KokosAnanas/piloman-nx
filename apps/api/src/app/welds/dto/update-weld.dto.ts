/**
 * DTO для обновления сварного соединения
 *
 * Использует PartialType из @nestjs/mapped-types для автоматического
 * создания partial-версии CreateWeldDto (все поля становятся опциональными).
 *
 * @see https://docs.nestjs.com/openapi/mapped-types#partial — NestJS Mapped Types
 * @see https://github.com/nestjs/mapped-types — @nestjs/mapped-types
 */

import { PartialType } from '@nestjs/mapped-types';
import { CreateWeldDto } from './create-weld.dto';

/**
 * UpdateWeldDto — данные для обновления сварного соединения
 *
 * Все поля опциональны — обновляются только переданные.
 * Наследует валидацию от CreateWeldDto.
 */
export class UpdateWeldDto extends PartialType(CreateWeldDto) {}
