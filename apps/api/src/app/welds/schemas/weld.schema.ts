/**
 * Mongoose Schema для сущности Weld (Сварное соединение)
 *
 * @see https://docs.nestjs.com/techniques/mongodb — NestJS MongoDB Integration
 * @see https://mongoosejs.com/docs/guide.html — Mongoose Schema Guide
 * @see https://mongoosejs.com/docs/api/schema.html#Schema.prototype.set() — toJSON transform
 */

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

/**
 * Тип документа Mongoose для Weld
 * HydratedDocument добавляет методы Mongoose к типизированному документу
 *
 * @see https://mongoosejs.com/docs/typescript.html — Mongoose TypeScript
 */
export type WeldDocument = HydratedDocument<Weld>;

/**
 * Mongoose Schema: Weld (Сварное соединение / Стык)
 *
 * Поля соответствуют интерфейсу Weld из @piloman/welds/models.
 * timestamps: true автоматически добавляет createdAt/updatedAt.
 */
@Schema({
  timestamps: true,
  // Преобразование _id → id при сериализации в JSON
  // @see https://mongoosejs.com/docs/api/document.html#Document.prototype.toJSON()
  toJSON: {
    virtuals: true,
    transform: (_doc, ret: Record<string, unknown>) => {
      // Преобразуем _id в id для единообразия API
      ret['id'] = String(ret['_id']);
      delete ret['_id'];
      delete ret['__v'];
      return ret;
    },
  },
})
export class Weld {
  /**
   * Название объекта строительства
   * Индекс для эффективной фильтрации стыков по объекту
   */
  @Prop({ index: true })
  objectName?: string;

  /** Наименование организации подрядчика */
  @Prop()
  contractor?: string;

  /** Наименование организации заказчика */
  @Prop()
  customer?: string;

  /**
   * Номер стыка/шва — основной бизнес-идентификатор
   * Индекс для быстрого поиска
   */
  @Prop({ required: true, index: true })
  weldNumber: string;

  /** Наружный диаметр, мм (D) */
  @Prop({ required: true })
  diameter: number;

  /** Толщина S1, мм */
  @Prop({ required: true })
  thickness1: number;

  /** Толщина S2, мм (для разнотолщинных соединений) */
  @Prop()
  thickness2?: number;

  /** Уровень качества: A, B, C */
  @Prop({ required: true, enum: ['A', 'B', 'C'] })
  qualityLevel: string;

  /** Дата выполнения сварки */
  @Prop()
  weldDate?: string;

  /**
   * Способ сварки
   * - SMAW_GMAW: Ручная дуговая / Полуавтоматическая
   * - GTAW: Автоматическая в защитных газах
   * - SAW: Автоматическая под флюсом
   */
  @Prop({ default: 'SMAW_GMAW', enum: ['SMAW_GMAW', 'GTAW', 'SAW'] })
  weldingProcess: string;

  /** Статус: draft, in_progress, done */
  @Prop({ enum: ['draft', 'in_progress', 'done'] })
  weldStatus?: string;

  /**
   * Методы НК (массив)
   * VT, UT, RT, MT, PT
   */
  @Prop({ type: [String], default: [], enum: ['VT', 'UT', 'RT', 'MT', 'PT'] })
  testMethods: string[];

  /** Заключение: OK, REPAIR, CUT */
  @Prop({ enum: ['OK', 'REPAIR', 'CUT'] })
  conclusion?: string;

  /**
   * Тип сварного соединения
   * - BUTT: Стыковое
   * - FILLET_LAP: Угловое / Нахлёсточное
   */
  @Prop({ default: 'BUTT', enum: ['BUTT', 'FILLET_LAP'] })
  joint?: string;

  /** Примечания */
  @Prop()
  notes?: string;
}

/**
 * Фабрика схемы Mongoose
 * @see https://docs.nestjs.com/techniques/mongodb#model-injection
 */
export const WeldSchema = SchemaFactory.createForClass(Weld);
