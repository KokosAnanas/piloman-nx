/**
 * NdtReportsWidgetComponent — виджет заключений по методам НК
 *
 * Отображает список заключений (протоколов) по методам
 * неразрушающего контроля для данного стыка.
 *
 * @see https://primeng.org/card — PrimeNG Card
 */

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

/**
 * Standalone компонент — виджет заключений НК
 *
 * TODO: Подключить реальные данные заключений через API
 */
@Component({
  selector: 'app-ndt-reports-widget',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, TagModule, TooltipModule],
  templateUrl: './ndt-reports-widget.component.html',
})
export class NdtReportsWidgetComponent {
  /**
   * ID стыка для загрузки заключений
   */
  @Input() weldId: string = '';

  /**
   * Заглушка: список заключений
   * TODO: Заменить на реальные данные из API
   */
  readonly mockReports = [
    {
      id: '1',
      method: 'ВИК',
      date: '2025-01-15',
      result: 'OK',
      inspector: 'Иванов И.И.',
    },
    {
      id: '2',
      method: 'УЗК',
      date: '2025-01-16',
      result: 'OK',
      inspector: 'Петров П.П.',
    },
  ];

  /**
   * Получение severity для Tag в зависимости от результата
   */
  getResultSeverity(result: string): 'success' | 'danger' | 'warn' | 'secondary' {
    switch (result) {
      case 'OK':
        return 'success';
      case 'REPAIR':
        return 'warn';
      case 'CUT':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  /**
   * Форматирование результата
   */
  formatResult(result: string): string {
    const map: Record<string, string> = {
      OK: 'Годен',
      REPAIR: 'Ремонт',
      CUT: 'Вырезать',
    };
    return map[result] || result;
  }

  /**
   * Форматирование даты
   */
  formatDate(value: string): string {
    try {
      const date = new Date(value);
      return date.toLocaleDateString('ru-RU');
    } catch {
      return value;
    }
  }
}