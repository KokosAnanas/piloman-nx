/**
 * NdtNormsWidgetComponent — виджет норм отбраковки
 *
 * Отображает применимые нормы отбраковки дефектов
 * для данного сварного соединения.
 *
 * @see https://primeng.org/card — PrimeNG Card
 */

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

/**
 * Standalone компонент — виджет норм отбраковки
 *
 * TODO: Подключить реальные данные норм через API
 */
@Component({
  selector: 'app-ndt-norms-widget',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, TooltipModule],
  templateUrl: './ndt-norms-widget.component.html',
})
export class NdtNormsWidgetComponent {
  /**
   * ID стыка для определения применимых норм
   */
  @Input() weldId: string = '';

  /**
   * Заглушка: список применимых норм
   * TODO: Заменить на реальные данные из API
   */
  readonly mockNorms = [
    {
      id: '1',
      code: 'ГОСТ 23118-2019',
      name: 'Конструкции стальные строительные',
      method: 'УЗК',
    },
    {
      id: '2',
      code: 'СТО Газпром 2-2.4-083-2006',
      name: 'Инструкция по неразрушающим методам контроля',
      method: 'РК',
    },
    {
      id: '3',
      code: 'РД 03-606-03',
      name: 'Инструкция по визуальному и измерительному контролю',
      method: 'ВИК',
    },
  ];
}