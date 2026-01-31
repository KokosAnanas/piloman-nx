/**
 * DTO для создания сварного соединения
 *
 * Использует class-validator для валидации входных данных.
 * ValidationPipe (глобальный) автоматически валидирует тело запроса.
 *
 * @see https://docs.nestjs.com/techniques/validation — NestJS Validation
 * @see https://github.com/typestack/class-validator — class-validator decorators
 */

import {
  IsString,
  IsNumber,
  IsOptional,
  IsIn,
  IsArray,
  Min,
  IsNotEmpty,
} from 'class-validator';

/**
 * CreateWeldDto — данные для создания нового сварного соединения
 *
 * Обязательные поля: weldNumber, diameter, thickness1, qualityLevel
 */
export class CreateWeldDto {
  /**
   * Название объекта строительства
   * @example "Газопровод Ду 500 участок 1"
   */
  @IsOptional()
  @IsString()
  objectName?: string;

  /**
   * Наименование организации подрядчика
   * @example "ООО СтройМонтаж"
   */
  @IsOptional()
  @IsString()
  contractor?: string;

  /**
   * Наименование организации заказчика
   * @example "ПАО Газпром"
   */
  @IsOptional()
  @IsString()
  customer?: string;

  /**
   * Номер стыка/шва (например "12-45")
   * @example "ШС-001"
   */
  @IsString()
  @IsNotEmpty({ message: 'Номер стыка обязателен' })
  weldNumber: string;

  /**
   * Наружный диаметр, мм
   * @example 219
   */
  @IsNumber({}, { message: 'Диаметр должен быть числом' })
  @Min(1, { message: 'Диаметр должен быть больше 0' })
  diameter: number;

  /**
   * Толщина стенки S1, мм
   * @example 8
   */
  @IsNumber({}, { message: 'Толщина S1 должна быть числом' })
  @Min(0.1, { message: 'Толщина S1 должна быть больше 0' })
  thickness1: number;

  /**
   * Толщина стенки S2, мм (опционально, для разнотолщинных)
   * @example 10
   */
  @IsOptional()
  @IsNumber({}, { message: 'Толщина S2 должна быть числом' })
  @Min(0.1, { message: 'Толщина S2 должна быть больше 0' })
  thickness2?: number;

  /**
   * Уровень качества: A, B или C
   * @example "B"
   */
  @IsIn(['A', 'B', 'C'], { message: 'Уровень качества должен быть A, B или C' })
  qualityLevel: 'A' | 'B' | 'C';

  /**
   * Дата сварки (ISO string)
   * @example "2024-01-15"
   */
  @IsOptional()
  @IsString()
  weldDate?: string;

  /**
   * Способ сварки
   * @example "SMAW_GMAW"
   */
  @IsOptional()
  @IsIn(['SMAW_GMAW', 'GTAW', 'SAW'], {
    message: 'Способ сварки должен быть SMAW_GMAW, GTAW или SAW',
  })
  weldingProcess?: 'SMAW_GMAW' | 'GTAW' | 'SAW';

  /**
   * Статус
   * @example "draft"
   */
  @IsOptional()
  @IsIn(['draft', 'in_progress', 'done'], {
    message: 'Статус должен быть draft, in_progress или done',
  })
  weldStatus?: 'draft' | 'in_progress' | 'done';

  /**
   * Методы НК (массив)
   * @example ["VT", "UT"]
   */
  @IsOptional()
  @IsArray()
  @IsIn(['VT', 'UT', 'RT', 'MT', 'PT'], {
    each: true,
    message: 'Метод НК должен быть VT, UT, RT, MT или PT',
  })
  testMethods?: ('VT' | 'UT' | 'RT' | 'MT' | 'PT')[];

  /**
   * Заключение
   * @example "OK"
   */
  @IsOptional()
  @IsIn(['OK', 'REPAIR', 'CUT'], {
    message: 'Заключение должно быть OK, REPAIR или CUT',
  })
  conclusion?: 'OK' | 'REPAIR' | 'CUT';

  /**
   * Тип соединения
   * @example "BUTT"
   */
  @IsOptional()
  @IsIn(['BUTT', 'FILLET_LAP'], {
    message: 'Тип соединения должен быть BUTT или FILLET_LAP',
  })
  joint?: 'BUTT' | 'FILLET_LAP';

  /**
   * Примечания
   * @example "Контроль выполнен после термообработки"
   */
  @IsOptional()
  @IsString()
  notes?: string;
}
