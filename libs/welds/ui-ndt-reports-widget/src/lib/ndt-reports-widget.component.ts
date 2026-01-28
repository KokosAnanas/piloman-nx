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

}
