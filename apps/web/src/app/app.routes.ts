/**
 * Маршруты приложения piloman.ru
 *
 * Используем lazy loading для загрузки feature-модулей по требованию.
 * Все маршруты обёрнуты в Layout для единого оформления.
 *
 * @see https://angular.dev/guide/routing — Angular Routing
 * @see https://angular.dev/guide/routing/lazy-loading — Lazy Loading
 */

import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  /**
   * Главная страница — редирект на /welds
   */
  {
    path: '',
    redirectTo: 'welds',
    pathMatch: 'full',
  },

  /**
   * Реестр сварных соединений
   *
   * Lazy loading компонента из feature-welds.
   * Импорт через публичный API библиотеки.
   */
  {
    path: 'welds',
    loadComponent: () =>
      import('@piloman/welds/feature-welds').then((m) => m.Welds),
  },

  /**
   * Дашборд отдельного сварного соединения
   *
   * Lazy loading компонента из feature-weld-dashboard.
   * URL: /welds/:weldId/dashboard
   */
  {
    path: 'welds/:weldId/dashboard',
    loadComponent: () =>
      import('@piloman/welds/feature-weld-dashboard').then((m) => m.WeldDashboard),
  },
];
