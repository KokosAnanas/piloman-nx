/**
 * UtReportWidget — виджет заключения УЗК
 *
 * Отображает заключение по ультразвуковому контролю
 * для данного стыка. Открывается по нажатию кнопки "УЗК" в виджете
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
 * Standalone компонент — виджет заключения УЗК
 *
 * TODO: Подключить реальные данные заключения через API
 */
@Component({
  selector: 'app-ut-report-widget',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, TooltipModule],
  templateUrl: './ut-report-widget.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UtReportWidget {
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
