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
  template: `
    <div class="layout-wrapper" [ngClass]="layoutService.containerClass()">
      <!-- Topbar -->
      <piloman-topbar />

      <!-- Sidebar -->
      <piloman-sidebar [menuItems]="menuItems()" />

      <!-- Main content -->
      <div class="layout-main-container">
        <div class="layout-main">
          <ng-content></ng-content>
        </div>

        <!-- Footer -->
        <piloman-footer />
      </div>

      <!-- Overlay mask (для мобилки и overlay mode) -->
      @if (layoutService.isSidebarActive()) {
        <div
          class="layout-mask"
          (click)="layoutService.hideOverlayMenu()"
        ></div>
      }

      <!-- Configurator panel -->
      <piloman-configurator />
    </div>
  `,
  styles: `
    .layout-wrapper {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .layout-main-container {
      display: flex;
      flex-direction: column;
      min-height: calc(100vh - 4rem);
      padding-top: 5rem;
      padding-left: 2rem;
      padding-right: 2rem;
      transition: margin-left 0.3s ease;
    }

    .layout-main {
      flex: 1;
      padding: 1rem 0;
    }

    /* Static mode - sidebar виден, контент сдвинут */
    .layout-static .layout-main-container {
      margin-left: 20rem;
    }

    /* Static mode - sidebar скрыт на desktop */
    .layout-static-inactive .layout-main-container {
      margin-left: 0;
    }

    .layout-static-inactive ::ng-deep .layout-sidebar {
      transform: translateX(-100%);
      opacity: 0;
    }

    /* Overlay mode - sidebar поверх */
    .layout-overlay .layout-main-container {
      margin-left: 0;
    }

    .layout-overlay ::ng-deep .layout-sidebar {
      transform: translateX(-100%);
      opacity: 0;
    }

    .layout-overlay-active ::ng-deep .layout-sidebar {
      transform: translateX(0);
      opacity: 1;
    }

    /* Mobile styles */
    .layout-mobile-active ::ng-deep .layout-sidebar {
      transform: translateX(0);
      opacity: 1;
    }

    /* Mask */
    .layout-mask {
      position: fixed;
      top: 4rem;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.4);
      z-index: 999;
      animation: fadeIn 0.2s ease;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    /* Mobile */
    @media (max-width: 991px) {
      .layout-main-container {
        margin-left: 0 !important;
        padding-left: 1rem;
        padding-right: 1rem;
      }

      ::ng-deep .layout-sidebar {
        transform: translateX(-100%);
        opacity: 0;
      }

      .layout-mobile-active ::ng-deep .layout-sidebar {
        transform: translateX(0);
        opacity: 1;
      }
    }

    /* Wide screens */
    @media (min-width: 1960px) {
      .layout-main-container {
        max-width: 1504px;
        margin-left: auto;
        margin-right: auto;
      }

      .layout-static .layout-main-container {
        margin-left: 20rem;
        margin-right: auto;
        max-width: calc(1504px + 20rem);
      }
    }
  `,
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