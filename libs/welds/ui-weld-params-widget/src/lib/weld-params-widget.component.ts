/**
 * WeldParamsWidgetComponent — виджет параметров сварного соединения
 *
 * Отображает основные характеристики стыка: диаметр, толщину,
 * уровень качества, способ сварки, тип соединения и т.д.
 *
 * @see https://primeng.org/card — PrimeNG Card
 */

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import type { Weld } from '@piloman/welds/models';

/**
 * Standalone компонент — виджет параметров стыка
 */
@Component({
  selector: 'app-weld-params-widget',
  standalone: true,
  imports: [CommonModule, CardModule],
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