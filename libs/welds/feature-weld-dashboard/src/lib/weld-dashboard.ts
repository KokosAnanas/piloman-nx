/**
 * WeldDashboard — страница-дашборд отдельного сварного соединения
 *
 * Отображает детальную информацию о стыке в виде виджетов-карточек.
 * Компоновка: слева виджет параметров, справа виджеты заключений и норм.
 *
 * @see https://primeng.org/card — PrimeNG Card
 * @see https://angular.dev/guide/routing — Angular Routing
 */

import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

// PrimeNG компоненты
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

// Виджеты домена welds
import { WeldParamsWidget } from '@piloman/welds/ui-weld-params-widget';
import { NdtReportsWidget } from '@piloman/welds/ui-ndt-reports-widget';
import { NdtNormsWidget } from '@piloman/welds/ui-ndt-norms-widget';
import { VtReportWidget } from '@piloman/welds/ui-vt-report-widget';
import { UtReportWidget } from '@piloman/welds/ui-ut-report-widget';
import { RtReportWidget } from '@piloman/welds/ui-rt-report-widget';
import { VtNormsWidget } from '@piloman/welds/ui-vt-norms-widget';
import { UtNormsWidget } from '@piloman/welds/ui-ut-norms-widget';
import { RtNormsWidget } from '@piloman/welds/ui-rt-norms-widget';
import { PtNormsWidget } from '@piloman/welds/ui-pt-norms-widget';
import { MtNormsWidget } from '@piloman/welds/ui-mt-norms-widget';

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
    WeldParamsWidget,
    NdtReportsWidget,
    NdtNormsWidget,
    VtReportWidget,
    UtReportWidget,
    RtReportWidget,
    VtNormsWidget,
    UtNormsWidget,
    RtNormsWidget,
    PtNormsWidget,
    MtNormsWidget,
  ],
  templateUrl: './weld-dashboard.html',
})
export class WeldDashboard implements OnInit {
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
   * Активный виджет (единый сигнал для заключений и норм)
   * Формат: 'method-type', например 'vik-report', 'uzk-norms'
   * @see https://angular.dev/guide/signals — Angular Signals
   */
  activeWidget = signal<string | null>(null);

  /**
   * ViewChild для доступа к виджету заключений НК
   * Нужен для синхронизации состояния кнопок при закрытии виджета
   * @see https://angular.dev/guide/components/queries — Angular ViewChild
   */
  @ViewChild('ndtReportsWidget') ndtReportsWidget!: NdtReportsWidget;

  /**
   * ViewChild для доступа к виджету норм НК
   * Нужен для синхронизации состояния кнопок при закрытии виджета
   */
  @ViewChild('ndtNormsWidget') ndtNormsWidget!: NdtNormsWidget;

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

  /**
   * Обработка переключения метода НК из виджета заключений
   * При открытии заключения сбрасываем виджет норм
   */
  onReportMethodToggled(method: string | null): void {
    if (method) {
      this.activeWidget.set(`${method}-report`);
      this.ndtNormsWidget.closeMethod();
    } else {
      this.activeWidget.set(null);
    }
  }

  /**
   * Обработка переключения метода НК из виджета норм
   * При открытии норм сбрасываем виджет заключений
   */
  onNormsMethodToggled(method: string | null): void {
    if (method) {
      this.activeWidget.set(`${method}-norms`);
      this.ndtReportsWidget.closeMethod();
    } else {
      this.activeWidget.set(null);
    }
  }

  /**
   * Закрытие виджета (по кнопке "x" в виджете)
   * Сбрасывает activeWidget и синхронизирует состояние кнопок
   */
  onWidgetClosed(): void {
    const current = this.activeWidget();
    this.activeWidget.set(null);
    if (current?.endsWith('-report')) {
      this.ndtReportsWidget.closeMethod();
    } else if (current?.endsWith('-norms')) {
      this.ndtNormsWidget.closeMethod();
    }
  }
}