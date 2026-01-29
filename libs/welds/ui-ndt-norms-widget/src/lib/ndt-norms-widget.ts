/**
 * NdtNormsWidget — виджет норм отбраковки
 *
 * Отображает применимые нормы отбраковки дефектов
 * для данного сварного соединения.
 *
 * @see https://primeng.org/card — PrimeNG Card
 * @see https://primeng.org/select — PrimeNG Select
 */

import { Component, input, output, signal } from '@angular/core';
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
  templateUrl: './ndt-norms-widget.html',
})
export class NdtNormsWidget {
  /**
   * ID стыка (для загрузки данных норм)
   * @see https://angular.dev/guide/components/inputs — Angular Inputs
   */
  weldId = input<string>('');

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

  /**
   * Какой метод НК активен (виджет норм открыт)
   * Возможные значения: 'vik', 'uzk', 'rk', 'pvk', 'mk' или null
   */
  activeMethod = signal<string | null>(null);

  /**
   * Событие переключения метода НК
   * Эмитит название метода при открытии или null при закрытии
   * @see https://angular.dev/guide/components/outputs — Angular Outputs
   */
  methodToggled = output<string | null>();

  /**
   * Переключить метод НК (открыть/закрыть виджет норм)
   * Если метод уже активен — закрываем, иначе — открываем
   */
  toggleMethod(method: string): void {
    const newValue = this.activeMethod() === method ? null : method;
    this.activeMethod.set(newValue);
    this.methodToggled.emit(newValue);
  }

  /**
   * Закрыть активный метод (вызывается извне при закрытии виджета норм)
   */
  closeMethod(): void {
    this.activeMethod.set(null);
  }
}
