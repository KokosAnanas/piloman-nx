/**
 * PtNormsWidget — виджет норм ПВК
 *
 * Отображает нормы отбраковки для капиллярного (проникающего) контроля
 * для данного стыка. Открывается по нажатию кнопки "ПВК" в виджете норм.
 *
 * @see https://primeng.org/card — PrimeNG Card
 */

import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

/**
 * Standalone компонент — виджет норм ПВК
 *
 * TODO: Подключить реальные данные норм через API
 */
@Component({
  selector: 'app-pt-norms-widget',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, TooltipModule],
  templateUrl: './pt-norms-widget.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PtNormsWidget {
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
