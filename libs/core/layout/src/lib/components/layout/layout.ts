import { Component, inject, input, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { MenuItem } from '../../layout.models';
import { LayoutService } from '../../layout.service';
import { Topbar } from '../topbar/topbar';
import { Sidebar } from '../sidebar/sidebar';
import { Footer } from '../footer/footer';
import { Configurator } from '../configurator/configurator';

/**
 * Главный layout компонент (shell) приложения.
 * Объединяет: topbar, sidebar, content area, footer и configurator.
 *
 * Поддерживает режимы меню:
 * - static: sidebar постоянно виден на desktop
 * - overlay: sidebar выезжает поверх контента
 *
 * @example
 * ```html
 * <piloman-layout [menuItems]="menuItems">
 *   <router-outlet></router-outlet>
 * </piloman-layout>
 * ```
 */
@Component({
  selector: 'piloman-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    Topbar,
    Sidebar,
    Footer,
    Configurator,
    Toast,
  ],
  providers: [MessageService],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout {
  readonly layoutService = inject(LayoutService);

  /** Элементы навигационного меню */
  menuItems = input<MenuItem[]>([]);

  /**
   * Обработчик изменения размера окна.
   * Скрывает overlay меню при переходе на desktop.
   */
  @HostListener('window:resize')
  onResize(): void {
    if (this.layoutService.isDesktop() && this.layoutService.isSidebarActive()) {
      this.layoutService.hideOverlayMenu();
    }
  }
}
