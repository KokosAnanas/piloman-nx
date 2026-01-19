/**
 * WeldsComponent — страница "Реестр сварных соединений"
 *
 * Отображает таблицу (PrimeNG p-table) со списком сварных соединений.
 * Данные загружаются через WeldsApiService.
 *
 * @see https://primeng.org/table — PrimeNG Table
 * @see https://angular.dev/guide/signals — Angular Signals
 */

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

// PrimeNG v21 Table
// @see https://primeng.org/table — PrimeNG Table
import { TableModule } from 'primeng/table';

// Data Access — API сервис
import { WeldsApiService } from '@piloman/welds/data-access';

// Типы из models
import type { Weld } from '@piloman/welds/models';

/**
 * Standalone компонент — страница реестра сварных соединений
 *
 * Использует:
 * - Angular Signals для состояния (welds, loading)
 * - PrimeNG Table для отображения данных
 * - WeldsApiService для загрузки данных с API
 */
@Component({
  selector: 'piloman-welds',
  standalone: true,
  imports: [CommonModule, TableModule],
  template: `
    <div class="p-4">
      <h1 class="text-2xl font-bold mb-4">Реестр сварных соединений</h1>

      <!-- Индикатор загрузки -->
      @if (loading()) {
        <div class="text-center p-4">Загрузка данных...</div>
      }

      <!-- Таблица PrimeNG -->
      <!-- @see https://primeng.org/table#basic -->
      <p-table
        [value]="welds()"
        [loading]="loading()"
        [paginator]="true"
        [rows]="10"
        [rowsPerPageOptions]="[5, 10, 25, 50]"
        styleClass="p-datatable-striped"
      >
        <ng-template pTemplate="header">
          <tr>
            <th>Номер стыка</th>
            <th>D, мм</th>
            <th>S1, мм</th>
            <th>S2, мм</th>
            <th>Уровень качества</th>
            <th>Дата сварки</th>
            <th>Способ сварки</th>
            <th>Тип соединения</th>
            <th>Методы НК</th>
            <th>Заключение</th>
            <th>Статус</th>
            <th>Примечание</th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-weld>
          <tr>
            <td>{{ weld.weldNumber }}</td>
            <td>{{ weld.diameter }}</td>
            <td>{{ weld.thickness1 }}</td>
            <td>{{ weld.thickness2 || '-' }}</td>
            <td>{{ weld.qualityLevel }}</td>
            <td>{{ weld.weldDate || '-' }}</td>
            <td>{{ formatWeldingProcess(weld.weldingProcess) }}</td>
            <td>{{ formatJoint(weld.joint) }}</td>
            <td>{{ formatTestMethods(weld.testMethods) }}</td>
            <td>{{ formatConclusion(weld.conclusion) }}</td>
            <td>{{ formatStatus(weld.weldStatus) }}</td>
            <td>{{ weld.notes || '-' }}</td>
          </tr>
        </ng-template>

        <!-- Пустая таблица -->
        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="12" class="text-center p-4">
              Нет данных. Добавьте сварные соединения через API.
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>
  `,
})
export class WeldsComponent implements OnInit {
  /**
   * WeldsApiService для загрузки данных
   * Используем inject() вместо constructor injection
   */
  private readonly weldsApi = inject(WeldsApiService);

  /**
   * Список сварных соединений (Angular Signal)
   * @see https://angular.dev/guide/signals
   */
  welds = signal<Weld[]>([]);

  /**
   * Флаг загрузки (Angular Signal)
   */
  loading = signal<boolean>(false);

  /**
   * Загрузка данных при инициализации компонента
   */
  ngOnInit(): void {
    this.loadWelds();
  }

  /**
   * Загрузка списка сварных соединений с API
   */
  private loadWelds(): void {
    this.loading.set(true);

    this.weldsApi.list().subscribe({
      next: (data) => {
        this.welds.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Ошибка загрузки данных:', err);
        this.loading.set(false);
      },
    });
  }

  /**
   * Форматирование способа сварки для отображения
   */
  formatWeldingProcess(value: string | undefined): string {
    const map: Record<string, string> = {
      SMAW_GMAW: 'РД/ПАС',
      GTAW: 'АрД',
      SAW: 'АФ',
    };
    return value ? map[value] || value : '-';
  }

  /**
   * Форматирование типа соединения
   */
  formatJoint(value: string | undefined): string {
    const map: Record<string, string> = {
      BUTT: 'Стыковое',
      FILLET_LAP: 'Угловое/Нахл.',
    };
    return value ? map[value] || value : '-';
  }

  /**
   * Форматирование методов НК (массив → строка)
   */
  formatTestMethods(value: string[] | undefined): string {
    if (!value || value.length === 0) return '-';

    const map: Record<string, string> = {
      VT: 'ВИК',
      UT: 'УЗК',
      RT: 'РК',
      MT: 'МК',
      PT: 'ПВК',
    };
    return value.map((m) => map[m] || m).join(', ');
  }

  /**
   * Форматирование заключения
   */
  formatConclusion(value: string | undefined): string {
    const map: Record<string, string> = {
      OK: 'Годен',
      REPAIR: 'Ремонт',
      CUT: 'Вырезать',
    };
    return value ? map[value] || value : '-';
  }

  /**
   * Форматирование статуса
   */
  formatStatus(value: string | undefined): string {
    const map: Record<string, string> = {
      draft: 'Черновик',
      in_progress: 'В работе',
      done: 'Завершён',
    };
    return value ? map[value] || value : '-';
  }
}
