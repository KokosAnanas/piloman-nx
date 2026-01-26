/**
 * WeldParamsWidgetComponent — виджет параметров сварного соединения
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
import { MessageService } from 'primeng/api';
import type { Weld } from '@piloman/welds/models';
import { WeldsApiService } from '@piloman/welds/data-access';

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
  ],
  templateUrl: './weld-params-widget.component.html',
})
export class WeldParamsWidgetComponent {
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
   */
  @Input() weld: Weld | null = null;

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
   * Обработчик изменения поля формы
   * Устанавливает флаг несохранённых изменений и добавляет поле в набор изменённых
   *
   * @param field - имя изменённого поля
   */
  onFieldChange(field: string): void {
    this.hasUnsavedChanges.set(true);
    this.changedFields.update((fields) => ({ ...fields, [field]: true }));
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
          Object.assign(this.weld!, updatedWeld);
        }

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

  /**
   * Форматирование способа сварки
   */
  formatWeldingProcess(value: string | undefined): string {
    const map: Record<string, string> = {
      SMAW_GMAW: 'РД/ПАС (ручная дуговая / полуавтоматическая)',
      GTAW: 'АрД (аргонодуговая)',
      SAW: 'АФ (автоматическая под флюсом)',
    };
    return value ? map[value] || value : '-';
  }

  /**
   * Форматирование типа соединения
   */
  formatJoint(value: string | undefined): string {
    const map: Record<string, string> = {
      BUTT: 'Стыковое',
      FILLET_LAP: 'Угловое / Нахлёсточное',
    };
    return value ? map[value] || value : '-';
  }

  /**
   * Форматирование уровня качества
   */
  formatQualityLevel(value: string | undefined): string {
    const map: Record<string, string> = {
      A: 'A — Высший',
      B: 'B — Средний',
      C: 'C — Базовый',
    };
    return value ? map[value] || value : '-';
  }

  /**
   * Форматирование статуса
   */
  formatStatus(value: string | undefined): string {
    const map: Record<string, string> = {
      draft: 'Черновик',
      in_progress: 'В работе',
      done: 'Завершён',
    };
    return value ? map[value] || value : '-';
  }

  /**
   * Форматирование даты
   */
  formatDate(value: string | undefined): string {
    if (!value) return '-';
    try {
      const date = new Date(value);
      return date.toLocaleDateString('ru-RU');
    } catch {
      return value;
    }
  }
}
