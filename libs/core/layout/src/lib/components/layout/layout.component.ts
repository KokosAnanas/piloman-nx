import { Component, inject, input, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MenuItem } from '../../layout.models';
import { LayoutService } from '../../layout.service';
import { TopbarComponent } from '../topbar/topbar.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { FooterComponent } from '../footer/footer.component';
import { ConfiguratorComponent } from '../configurator/configurator.component';

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
    TopbarComponent,
    SidebarComponent,
    FooterComponent,
    ConfiguratorComponent,
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
})
export class LayoutComponent {
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
