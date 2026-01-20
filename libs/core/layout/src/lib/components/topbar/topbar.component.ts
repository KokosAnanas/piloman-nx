import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

import { LayoutService } from '../../layout.service';
import { ThemeService } from '@piloman/core/theme';

/**
 * Верхняя панель (Topbar) приложения.
 * Содержит:
 * - Логотип и название
 * - Кнопку меню (hamburger)
 * - Кнопку переключения темы (dark/light)
 * - Кнопку настроек (конфигуратор)
 */
@Component({
  selector: 'piloman-topbar',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, TooltipModule],
  template: `
    <div class="layout-topbar">
      <!-- Логотип -->
      <a class="layout-topbar-logo" routerLink="/">
        <span class="layout-topbar-logo-text">piloman</span>
      </a>

      <!-- Кнопка hamburger меню -->
      <button
        pButton
        type="button"
        class="layout-topbar-menu-button"
        [icon]="'pi pi-bars'"
        [rounded]="true"
        [text]="true"
        (click)="layoutService.toggleMenu()"
      ></button>

      <!-- Правая часть - кнопки -->
      <div class="layout-topbar-actions">
        <!-- Переключатель темы -->
        <button
          pButton
          type="button"
          [icon]="themeService.darkMode() ? 'pi pi-sun' : 'pi pi-moon'"
          [rounded]="true"
          [text]="true"
          (click)="themeService.toggleDarkMode()"
          [pTooltip]="themeService.darkMode() ? 'Светлая тема' : 'Тёмная тема'"
          tooltipPosition="bottom"
        ></button>

        <!-- Кнопка настроек -->
        <button
          pButton
          type="button"
          icon="pi pi-cog"
          [rounded]="true"
          [text]="true"
          (click)="layoutService.showConfigSidebar()"
          pTooltip="Настройки"
          tooltipPosition="bottom"
        ></button>
      </div>
    </div>
  `,
  styles: `
    .layout-topbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 4rem;
      padding: 0 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background-color: var(--p-content-background);
      border-bottom: 1px solid var(--p-content-border-color);
      z-index: 1100;
    }

    .layout-topbar-logo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      color: var(--p-text-color);
      font-weight: 700;
      font-size: 1.25rem;
    }

    .layout-topbar-logo-text {
      background: linear-gradient(90deg, var(--p-primary-color), var(--p-primary-400));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .layout-topbar-menu-button {
      display: none;
    }

    .layout-topbar-actions {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    /* Mobile */
    @media (max-width: 991px) {
      .layout-topbar {
        padding: 0 1rem;
      }

      .layout-topbar-menu-button {
        display: inline-flex;
      }
    }
  `,
})
export class TopbarComponent {
  readonly layoutService = inject(LayoutService);
  readonly themeService = inject(ThemeService);
}