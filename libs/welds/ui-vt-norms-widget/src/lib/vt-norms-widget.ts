/**
 * VtNormsWidget — виджет норм ВИК
 *
 * Отображает нормы отбраковки для визуального и измерительного контроля
 * для данного стыка. Открывается по нажатию кнопки "ВИК" в виджете норм.
 *
 * @see https://primeng.org/card — PrimeNG Card
 */

import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

/**
 * Standalone компонент — виджет норм ВИК
 *
 * TODO: Подключить реальные данные норм через API
 */
@Component({
  selector: 'app-vt-norms-widget',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, TooltipModule],
  templateUrl: './vt-norms-widget.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VtNormsWidget {
  /**
   * Событие закрытия виджета
   * @see https://angular.dev/guide/components/outputs — Angular Outputs
   */
  closed = output<void>();

  /**
   * Обработчик закрытия виджета
   */
  onClose(): void {
    this.closed.emit();
  }
}
