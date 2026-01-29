/**
 * RtReportWidget — виджет заключения РК
 *
 * Отображает заключение по радиографическому контролю
 * для данного стыка. Открывается по нажатию кнопки "РК" в виджете
 * заключений НК.
 *
 * @see https://primeng.org/card — PrimeNG Card
 */

import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

/**
 * Standalone компонент — виджет заключения РК
 *
 * TODO: Подключить реальные данные заключения через API
 */
@Component({
  selector: 'app-rt-report-widget',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, TooltipModule],
  templateUrl: './rt-report-widget.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RtReportWidget {
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
