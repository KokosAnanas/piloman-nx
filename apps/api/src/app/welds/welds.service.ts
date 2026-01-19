/**
 * WeldsService — сервис бизнес-логики для сварных соединений
 *
 * Инкапсулирует работу с MongoDB через Mongoose.
 * Контроллер делегирует операции этому сервису.
 *
 * @see https://docs.nestjs.com/providers — NestJS Providers (Services)
 * @see https://docs.nestjs.com/techniques/mongodb — MongoDB Integration
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Weld, WeldDocument } from './schemas/weld.schema';
import { CreateWeldDto } from './dto/create-weld.dto';
import { UpdateWeldDto } from './dto/update-weld.dto';

/**
 * Сервис для работы с реестром сварных соединений
 *
 * Предоставляет CRUD операции:
 * - create: создание нового соединения
 * - findAll: получение списка (с опциональным поиском)
 * - findOne: получение по ID
 * - update: обновление
 * - remove: удаление
 */
@Injectable()
export class WeldsService {
  constructor(
    /**
     * Инжектируем Mongoose модель для Weld
     * @see https://docs.nestjs.com/techniques/mongodb#model-injection
     */
    @InjectModel(Weld.name)
    private readonly weldModel: Model<WeldDocument>
  ) {}

  /**
   * Создание нового сварного соединения
   *
   * @param createWeldDto - данные для создания
   * @returns созданный документ Weld
   */
  async create(createWeldDto: CreateWeldDto): Promise<Weld> {
    const weld = new this.weldModel(createWeldDto);
    return weld.save();
  }

  /**
   * Получение списка сварных соединений
   *
   * Поддерживает поиск по номеру стыка (weldNumber), case-insensitive.
   *
   * @param search - строка поиска (опционально)
   * @returns массив документов Weld
   *
   * @see https://mongoosejs.com/docs/api/model.html#Model.find()
   */
  async findAll(search?: string): Promise<Weld[]> {
    // Если передан search — фильтруем по weldNumber (регистронезависимо)
    const filter = search
      ? { weldNumber: { $regex: search, $options: 'i' } }
      : {};

    // Сортировка по дате создания (новые первыми)
    return this.weldModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  /**
   * Получение одного сварного соединения по ID
   *
   * @param id - MongoDB ObjectId
   * @returns документ Weld
   * @throws NotFoundException если документ не найден
   */
  async findOne(id: string): Promise<Weld> {
    const weld = await this.weldModel.findById(id).exec();

    if (!weld) {
      throw new NotFoundException(`Сварное соединение с ID "${id}" не найдено`);
    }

    return weld;
  }

  /**
   * Обновление сварного соединения
   *
   * @param id - MongoDB ObjectId
   * @param updateWeldDto - данные для обновления
   * @returns обновлённый документ Weld
   * @throws NotFoundException если документ не найден
   *
   * @see https://mongoosejs.com/docs/api/model.html#Model.findByIdAndUpdate()
   */
  async update(id: string, updateWeldDto: UpdateWeldDto): Promise<Weld> {
    const weld = await this.weldModel
      .findByIdAndUpdate(id, updateWeldDto, {
        new: true, // Возвращаем обновлённый документ
        runValidators: true, // Запускаем валидаторы схемы
      })
      .exec();

    if (!weld) {
      throw new NotFoundException(`Сварное соединение с ID "${id}" не найдено`);
    }

    return weld;
  }

  /**
   * Удаление сварного соединения
   *
   * @param id - MongoDB ObjectId
   * @throws NotFoundException если документ не найден
   *
   * @see https://mongoosejs.com/docs/api/model.html#Model.findByIdAndDelete()
   */
  async remove(id: string): Promise<void> {
    const result = await this.weldModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException(`Сварное соединение с ID "${id}" не найдено`);
    }
  }
}
