/**
 * UtNormsWidget — виджет норм УЗК
 *
 * Отображает нормы отбраковки для ультразвукового контроля
 * для данного стыка. Открывается по нажатию кнопки "УЗК" в виджете норм.
 *
 * @see https://primeng.org/card — PrimeNG Card
 */

import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

/**
 * Standalone компонент — виджет норм УЗК
 *
 * TODO: Подключить реальные данные норм через API
 */
@Component({
  selector: 'app-ut-norms-widget',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, TooltipModule],
  templateUrl: './ut-norms-widget.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UtNormsWidget {
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
