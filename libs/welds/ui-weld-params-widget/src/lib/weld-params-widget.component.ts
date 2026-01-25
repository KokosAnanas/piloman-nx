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
 */

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { InputNumber } from 'primeng/inputnumber';
import { SelectButton } from 'primeng/selectbutton';
import type { Weld } from '@piloman/welds/models';

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
  ],
  templateUrl: './weld-params-widget.component.html',
})
export class WeldParamsWidgetComponent {
  /**
   * ID стыка для возможной подгрузки данных
   */
  @Input() weldId: string = '';

  /**
   * Данные стыка (передаются от родителя)
   */
  @Input() weld: Weld | null = null;

  /**
   * Варианты уровня качества для SelectButton
   */
  readonly qualityLevelOptions = [
    { label: 'A — Высший', value: 'A' },
    { label: 'B — Средний', value: 'B' },
    { label: 'C — Базовый', value: 'C' },
  ];

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