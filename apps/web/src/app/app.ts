/**
 * Корневой компонент приложения piloman.ru
 *
 * Использует LayoutComponent из @piloman/core/layout для оформления.
 * Layout включает: topbar, sidebar, content area, footer и configurator.
 *
 * @see https://angular.dev/guide/standalone-components — Standalone Components
 */

import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LayoutComponent, MenuItem } from '@piloman/core/layout';

@Component({
  imports: [RouterModule, LayoutComponent],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  /**
   * Элементы навигационного меню.
   * Передаются в LayoutComponent для отображения в Sidebar.
   */
  protected readonly menuItems: MenuItem[] = [
    {
      label: 'Главная',
      items: [
        {
          label: 'Дашборд',
          icon: 'pi pi-home',
          routerLink: '/',
        },
      ],
    },
    {
      label: 'Документы',
      items: [
        {
          label: 'Реестр сварных соединений',
          icon: 'pi pi-list',
          routerLink: '/welds',
        },
        {
          label: 'Протоколы',
          icon: 'pi pi-file',
          routerLink: '/protocols',
        },
        {
          label: 'Заключения',
          icon: 'pi pi-file-check',
          routerLink: '/conclusions',
        },
      ],
    },
    {
      label: 'Справочники',
      items: [
        {
          label: 'Специалисты',
          icon: 'pi pi-users',
          routerLink: '/specialists',
        },
        {
          label: 'Оборудование',
          icon: 'pi pi-wrench',
          routerLink: '/equipment',
        },
      ],
    },
  ];
}
