/**
 * DTO (Data Transfer Objects) для операций с сварными соединениями
 *
 * Эти типы используются для типизации запросов API.
 * На бэкенде (NestJS) на их основе создаются классы с декораторами class-validator.
 *
 * @see https://docs.nestjs.com/techniques/validation — NestJS Validation
 * @see https://github.com/typestack/class-validator — class-validator
 */

import type {
  JointType,
  QualityLevel,
  TestMethod,
  WeldConclusion,
  WeldingProcess,
  WeldStatus,
} from './weld.model';

/**
 * DTO для создания нового сварного соединения
 *
 * Обязательные поля: weldNumber, diameter, thickness1, qualityLevel
 */
export interface CreateWeldDto {
  /** Номер стыка/шва — обязательно */
  weldNumber: string;

  /** Наружный диаметр, мм — обязательно */
  diameter: number;

  /** Толщина S1, мм — обязательно */
  thickness1: number;

  /** Толщина S2, мм (для разнотолщинных) */
  thickness2?: number;

  /** Уровень качества — обязательно */
  qualityLevel: QualityLevel;

  /** Дата сварки (ISO string) */
  weldDate?: string;

  /** Способ сварки. По умолчанию: SMAW_GMAW */
  weldingProcess?: WeldingProcess;

  /** Статус */
  weldStatus?: WeldStatus;

  /** Методы НК */
  testMethods?: TestMethod[];

  /** Заключение */
  conclusion?: WeldConclusion;

  /** Тип соединения. По умолчанию: BUTT */
  joint?: JointType;

  /** Примечания */
  notes?: string;
}

/**
 * DTO для обновления сварного соединения
 *
 * Все поля опциональны — обновляются только переданные.
 */
export type UpdateWeldDto = Partial<CreateWeldDto>;

/**
 * DTO для запроса списка сварных соединений с пагинацией и поиском
 */
export interface WeldListQuery {
  /** Номер страницы (начиная с 1) */
  page?: number;

  /** Количество записей на странице */
  limit?: number;

  /** Поиск по номеру стыка (weldNumber), case-insensitive */
  search?: string;
}
