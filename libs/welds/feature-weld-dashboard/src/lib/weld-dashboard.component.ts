/**
 * WeldDashboardComponent — страница-дашборд отдельного сварного соединения
 *
 * Отображает детальную информацию о стыке в виде виджетов-карточек.
 * Компоновка: слева виджет параметров, справа виджеты заключений и норм.
 *
 * @see https://primeng.org/card — PrimeNG Card
 * @see https://angular.dev/guide/routing — Angular Routing
 */

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

// PrimeNG компоненты
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

// Виджеты домена welds
import { WeldParamsWidgetComponent } from '@piloman/welds/ui-weld-params-widget';
import { NdtReportsWidgetComponent } from '@piloman/welds/ui-ndt-reports-widget';
import { NdtNormsWidgetComponent } from '@piloman/welds/ui-ndt-norms-widget';

// Data Access
import { WeldsApiService } from '@piloman/welds/data-access';
import type { Weld } from '@piloman/welds/models';

/**
 * Standalone компонент — дашборд сварного соединения
 *
 * Использует:
 * - ActivatedRoute для получения weldId из URL
 * - WeldsApiService для загрузки данных стыка
 * - Три виджета для отображения информации
 */
@Component({
  selector: 'piloman-weld-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ButtonModule,
    TooltipModule,
    WeldParamsWidgetComponent,
    NdtReportsWidgetComponent,
    NdtNormsWidgetComponent,
  ],
  templateUrl: './weld-dashboard.component.html',
})
export class WeldDashboardComponent implements OnInit {
  /**
   * ActivatedRoute для получения параметров маршрута
   */
  private readonly route = inject(ActivatedRoute);

  /**
   * WeldsApiService для загрузки данных стыка
   */
  private readonly weldsApi = inject(WeldsApiService);

  /**
   * ID стыка из URL
   */
  weldId = signal<string>('');

  /**
   * Данные текущего стыка
   */
  weld = signal<Weld | null>(null);

  /**
   * Флаг загрузки
   */
  loading = signal<boolean>(false);

  /**
   * Сообщение об ошибке
   */
  error = signal<string | null>(null);

  /**
   * Инициализация: получаем weldId из URL и загружаем данные
   */
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('weldId');
    if (id) {
      this.weldId.set(id);
      this.loadWeld(id);
    }
  }

  /**
   * Загрузка данных стыка по ID
   */
  private loadWeld(id: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.weldsApi.get(id).subscribe({
      next: (weld) => {
        this.weld.set(weld);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Ошибка загрузки стыка:', err);
        this.error.set('Не удалось загрузить данные стыка');
        this.loading.set(false);
      },
    });
  }
}