/**
 * WeldParamsWidget — виджет параметров сварного соединения
 *
 * Отображает и позволяет редактировать основные характеристики стыка:
 * диаметр, толщину, уровень качества, способ сварки, тип соединения и т.д.
 *
 * @see https://primeng.org/card — PrimeNG Card
 * @see https://primeng.org/floatlabel — PrimeNG FloatLabel
 * @see https://primeng.org/inputnumber — PrimeNG InputNumber
 * @see https://primeng.org/selectbutton — PrimeNG SelectButton
 * @see https://primeng.org/button — PrimeNG Button
 * @see https://primeng.org/toast — PrimeNG Toast
 * @see https://angular.dev/guide/signals — Angular Signals
 */

import { Component, Input, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { CardModule } from 'primeng/card';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { InputNumber } from 'primeng/inputnumber';
import { SelectButton } from 'primeng/selectbutton';
import { Button } from 'primeng/button';
import { Tooltip } from 'primeng/tooltip';
import { DatePicker } from 'primeng/datepicker';
import { MessageService } from 'primeng/api';
import type { Weld } from '@piloman/welds/models';
import { WeldsApiService } from '@piloman/welds/data-access';
import {Select} from "primeng/select";

/**
 * Standalone компонент — виджет параметров стыка с формой редактирования
 */
@Component({
  selector: 'app-weld-params-widget',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    FloatLabel,
    InputText,
    Textarea,
    InputNumber,
    SelectButton,
    Button,
    Tooltip,
    DatePicker,
    Select,
  ],
  templateUrl: './weld-params-widget.html',
})
export class WeldParamsWidget {
  /**
   * Сервис для работы с API сварных соединений
   */
  private readonly weldsApi = inject(WeldsApiService);

  /**
   * Сервис для отображения Toast уведомлений
   * @see https://primeng.org/toast
   */
  private readonly messageService = inject(MessageService);

  /**
   * ID стыка для возможной подгрузки данных
   */
  @Input() weldId: string = '';

  /**
   * Данные стыка (передаются от родителя)
   * При установке сохраняем копию исходных значений для сравнения и сброса
   */
  @Input()
  set weld(value: Weld | null) {
    this._weld = value;
    // Сохраняем копию исходных значений при получении данных
    this.originalWeld = value ? { ...value } : null;
    // Сбрасываем состояние изменений
    this.changedFields.set({});
    this.hasUnsavedChanges.set(false);
    // Сбрасываем кэш даты для корректной работы при переключении между стыками
    this._lastWeldDateString = undefined;
    this._weldDateCache = null;
  }
  get weld(): Weld | null {
    return this._weld;
  }
  private _weld: Weld | null = null;

  /**
   * Исходные значения weld для сравнения и сброса
   */
  private originalWeld: Weld | null = null;

  /**
   * Кэшированное значение weldDate как Date для p-datepicker
   * Предотвращает бесконечный цикл change detection
   * @see https://primeng.org/datepicker
   */
  private _weldDateCache: Date | null = null;

  /**
   * Последнее значение weldDate (строка) для отслеживания изменений
   */
  private _lastWeldDateString: string | null | undefined = undefined;

  /**
   * Флаг наличия несохранённых изменений (signal)
   * @see https://angular.dev/guide/signals
   */
  hasUnsavedChanges = signal(false);

  /**
   * Флаг процесса сохранения (для loading состояния кнопки)
   */
  isSaving = signal(false);

  /**
   * Объект с флагами изменённых полей для подсветки (signal)
   * Используем signal для корректной работы с change detection
   */
  changedFields = signal<Record<string, boolean>>({});

  /**
   * Варианты уровня качества для SelectButton
   */
  readonly qualityLevelOptions = [
    { label: 'A', value: 'A' },
    { label: 'B', value: 'B' },
    { label: 'C', value: 'C' },
  ];

  /**
   * Варианты способа сварки для Select
   * @see WeldingProcess в weld.model.ts
   */
  readonly weldingProcessOptions = [
    { name: 'Ручная дуговая, полуавтоматическая', value: 'SMAW_GMAW' },
    { name: 'Автоматическая в защитных газах', value: 'GTAW' },
    { name: 'Автоматическая под флюсом', value: 'SAW' },
  ];

  /**
   * Варианты типа сварного соединения для Select
   * @see JointType в weld.model.ts
   */
  readonly jointTypeOptions = [
    { name: 'Стыковое', value: 'BUTT' },
    { name: 'Угловое/Нахлёсточное', value: 'FILLET_LAP' },
  ];

  /**
   * Путь к изображению схемы соединения в зависимости от типа joint
   * Используем getter вместо computed, т.к. weld — обычный объект (не signal),
   * и computed не отслеживает его изменения
   */
  get jointImagePath(): string {
    const joint = this.weld?.joint ?? 'BUTT';
    const filename = joint === 'FILLET_LAP' ? 'fillet_lap' : 'butt';
    return `/welds/weld-profiles-joint/${filename}.png`;
  }

  /**
   * Getter для weldDate — преобразует string в Date для p-datepicker
   * Использует кэширование для предотвращения бесконечного цикла change detection
   * @see https://primeng.org/datepicker
   */
  get weldDateAsDate(): Date | null {
    const currentDateString = this.weld?.weldDate;

    // Если строка не изменилась — возвращаем кэш
    if (currentDateString === this._lastWeldDateString) {
      return this._weldDateCache;
    }

    // Строка изменилась — обновляем кэш
    this._lastWeldDateString = currentDateString;

    if (!currentDateString) {
      this._weldDateCache = null;
    } else {
      this._weldDateCache = new Date(currentDateString);
    }

    return this._weldDateCache;
  }

  /**
   * Setter для weldDate — преобразует Date в string (ISO формат YYYY-MM-DD)
   * @see https://primeng.org/datepicker
   */
  set weldDateAsDate(value: Date | null) {
    if (!this.weld) return;

    if (value instanceof Date) {
      // Формат YYYY-MM-DD с использованием локального времени
      // (toISOString() конвертирует в UTC, что сдвигает дату на день назад для UTC+ часовых поясов)
      const year = value.getFullYear();
      const month = String(value.getMonth() + 1).padStart(2, '0');
      const day = String(value.getDate()).padStart(2, '0');
      this.weld.weldDate = `${year}-${month}-${day}`;
    } else {
      // Используем null вместо undefined, чтобы значение сериализовалось в JSON
      // и было отправлено на сервер для очистки поля в базе данных
      this.weld.weldDate = null;
    }

    // Обновляем кэш сразу после изменения
    this._lastWeldDateString = this.weld.weldDate;
    this._weldDateCache = value;

    this.onFieldChange('weldDate');
  }

  /**
   * Проверяет, является ли значение "пустым" (null, undefined или пустая строка)
   * Используется для корректного сравнения полей формы
   */
  private isEmpty(value: unknown): boolean {
    return value === null || value === undefined || value === '';
  }

  /**
   * Сравнивает два значения с учётом "пустых" значений
   * null, undefined и '' считаются эквивалентными
   * Решает проблему: p-inputNumber выставляет null при blur на пустом поле,
   * а исходное значение может быть undefined
   */
  private valuesEqual(a: unknown, b: unknown): boolean {
    // Если оба пустые — равны
    if (this.isEmpty(a) && this.isEmpty(b)) {
      return true;
    }
    return a === b;
  }

  /**
   * Обработчик изменения поля формы
   * Сравнивает текущее значение с исходным — если равны, убирает подсветку
   *
   * @param field - имя изменённого поля
   */
  onFieldChange(field: string): void {
    if (!this.weld || !this.originalWeld) return;

    const currentValue = (this.weld as unknown as Record<string, unknown>)[field];
    const originalValue = (this.originalWeld as unknown as Record<string, unknown>)[field];

    // Сравниваем текущее значение с исходным (с учётом "пустых" значений)
    const isChanged = !this.valuesEqual(currentValue, originalValue);

    this.changedFields.update((fields) => {
      const newFields = { ...fields };
      if (isChanged) {
        newFields[field] = true;
      } else {
        delete newFields[field];
      }
      return newFields;
    });

    // Обновляем флаг наличия изменений
    this.hasUnsavedChanges.set(Object.keys(this.changedFields()).length > 0);
  }

  /**
   * Сброс всех изменений к исходным значениям
   *
   * Важно: Object.assign не копирует undefined значения, поэтому
   * явно присваиваем каждое редактируемое поле
   */
  resetChanges(): void {
    if (!this.originalWeld || !this._weld) return;

    // Явно восстанавливаем все редактируемые поля (включая undefined/null)
    // Object.assign не копирует undefined, поэтому используем явное присваивание
    this._weld.weldNumber = this.originalWeld.weldNumber;
    this._weld.diameter = this.originalWeld.diameter;
    this._weld.thickness1 = this.originalWeld.thickness1;
    this._weld.thickness2 = this.originalWeld.thickness2;
    this._weld.qualityLevel = this.originalWeld.qualityLevel;
    this._weld.weldDate = this.originalWeld.weldDate;
    this._weld.weldingProcess = this.originalWeld.weldingProcess;
    this._weld.joint = this.originalWeld.joint;
    this._weld.notes = this.originalWeld.notes;

    // Сбрасываем состояние
    this.changedFields.set({});
    this.hasUnsavedChanges.set(false);

    // Сбрасываем кэш даты для корректного пересчёта из восстановленных данных
    this._lastWeldDateString = undefined;
    this._weldDateCache = null;
  }

  /**
   * Сохранение изменений в базу данных
   * Показывает loading на кнопке, после ответа API показывает Toast
   */
  saveChanges(): void {
    if (!this.weld?.id) return;

    const weldNumber = this.weld.weldNumber || this.weld.id;
    this.isSaving.set(true);

    this.weldsApi.update(this.weld.id, this.weld).subscribe({
      next: (updatedWeld) => {
        // Обновляем данные из ответа сервера
        if (updatedWeld) {
          Object.assign(this._weld!, updatedWeld);
        }

        // Обновляем исходные значения после успешного сохранения
        this.originalWeld = { ...this._weld! };

        this.hasUnsavedChanges.set(false);
        this.changedFields.set({});
        this.isSaving.set(false);

        // Toast успеха
        this.messageService.add({
          severity: 'success',
          summary: 'Успешно',
          detail: `Стык "${weldNumber}" обновлён`,
          life: 3000,
        });
      },
      error: (err: HttpErrorResponse) => {
        this.isSaving.set(false);

        // Извлекаем сообщение об ошибке из ответа
        const errorMessage = this.extractErrorMessage(err);

        // Toast ошибки
        this.messageService.add({
          severity: 'error',
          summary: 'Ошибка',
          detail: `Ошибка обновления стыка "${weldNumber}"${errorMessage ? `: ${errorMessage}` : ''}`,
          life: 5000,
        });
      },
    });
  }

  /**
   * Извлечение сообщения об ошибке из HTTP ответа
   */
  private extractErrorMessage(err: HttpErrorResponse): string {
    // Проверяем различные форматы ответа сервера
    if (err.error?.message) {
      return err.error.message;
    }
    if (err.error?.error) {
      return err.error.error;
    }
    if (typeof err.error === 'string') {
      return err.error;
    }
    if (err.message) {
      return err.message;
    }
    return '';
  }
}
