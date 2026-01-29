/**
 * NdtReportsWidget — виджет заключений по методам НК
 *
 * Отображает список заключений (протоколов) по методам
 * неразрушающего контроля для данного стыка.
 *
 * @see https://primeng.org/card — PrimeNG Card
 */

import { Component, input, output, signal } from '@angular/core';
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
  templateUrl: './ndt-reports-widget.html',
})
export class NdtReportsWidget {
  /**
   * ID стыка (для загрузки данных заключений)
   * @see https://angular.dev/guide/components/inputs — Angular Inputs
   */
  weldId = input<string>('');

  /**
   * Какой метод НК активен (виджет открыт)
   * Возможные значения: 'vik', 'uzk', 'rk', 'pvk', 'mk' или null
   */
  activeMethod = signal<string | null>(null);

  /**
   * Событие переключения метода НК
   * Эмитит название метода при открытии или null при закрытии
   * @see https://angular.dev/guide/components/outputs — Angular Outputs
   */
  methodToggled = output<string | null>();

  /**
   * Переключить метод НК (открыть/закрыть виджет заключения)
   * Если метод уже активен — закрываем, иначе — открываем
   */
  toggleMethod(method: string): void {
    const newValue = this.activeMethod() === method ? null : method;
    this.activeMethod.set(newValue);
    this.methodToggled.emit(newValue);
  }

  /**
   * Закрыть активный метод (вызывается извне при закрытии виджета заключения)
   */
  closeMethod(): void {
    this.activeMethod.set(null);
  }
}
