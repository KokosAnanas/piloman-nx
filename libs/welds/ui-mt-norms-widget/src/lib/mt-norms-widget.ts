/**
 * MtNormsWidget — виджет норм МК
 *
 * Отображает нормы отбраковки для магнитопорошкового контроля
 * для данного стыка. Открывается по нажатию кнопки "МК" в виджете норм.
 *
 * @see https://primeng.org/card — PrimeNG Card
 */

import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

/**
 * Standalone компонент — виджет норм МК
 *
 * TODO: Подключить реальные данные норм через API
 */
@Component({
  selector: 'app-mt-norms-widget',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, TooltipModule],
  templateUrl: './mt-norms-widget.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MtNormsWidget {
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
