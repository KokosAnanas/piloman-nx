/**
 * NdtNormsWidgetComponent — виджет норм отбраковки
 *
 * Отображает применимые нормы отбраковки дефектов
 * для данного сварного соединения.
 *
 * @see https://primeng.org/card — PrimeNG Card
 * @see https://primeng.org/select — PrimeNG Select
 */

import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { SelectModule } from 'primeng/select';

/**
 * Standalone компонент — виджет норм отбраковки
 *
 * TODO: Подключить реальные данные норм через API
 */
@Component({
  selector: 'app-ndt-norms-widget',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, ButtonModule, TooltipModule, SelectModule],
  templateUrl: './ndt-norms-widget.component.html',
})
export class NdtNormsWidgetComponent {
  /**
   * Опции нормативных документов для выбора
   */
  normOptions = [
    { name: 'СТО Газпром 15-1.3-004-2023', value: 'sto-15-1.3-004-2023' },
    { name: 'Р Газпром 2-2.2-606-2011', value: 'r-2-2.2-606-2011' },
    { name: 'СТО Газпром 2-2.4-083-2006', value: 'sto-2-2.4-083-2006' },
  ];

  /**
   * Выбранная норма (по умолчанию первая — СТО Газпром 15-1.3-004-2023)
   */
  selectedNorm = signal(this.normOptions[0].value);
}
