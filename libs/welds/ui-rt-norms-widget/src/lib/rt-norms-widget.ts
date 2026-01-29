/**
 * RtNormsWidget — виджет норм РК
 *
 * Отображает нормы отбраковки для радиографического контроля
 * для данного стыка. Открывается по нажатию кнопки "РК" в виджете норм.
 *
 * @see https://primeng.org/card — PrimeNG Card
 */

import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

/**
 * Standalone компонент — виджет норм РК
 *
 * TODO: Подключить реальные данные норм через API
 */
@Component({
  selector: 'app-rt-norms-widget',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, TooltipModule],
  templateUrl: './rt-norms-widget.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RtNormsWidget {
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
