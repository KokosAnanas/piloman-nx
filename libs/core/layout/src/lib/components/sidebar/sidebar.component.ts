import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MenuItem } from '../../layout.models';
import { MenuComponent } from '../menu/menu.component';

/**
 * Боковая панель (Sidebar) с навигационным меню.
 * Содержит основное меню приложения.
 */
@Component({
  selector: 'piloman-sidebar',
  standalone: true,
  imports: [CommonModule, MenuComponent],
  template: `
    <div class="layout-sidebar">
      <piloman-menu [items]="menuItems()" />
    </div>
  `,
  styles: `
    .layout-sidebar {
      position: fixed;
      top: 6rem;
      left: 2rem;
      width: 18rem;
      height: calc(100vh - 8rem);
      background-color: var(--p-content-background);
      border-radius: var(--p-content-border-radius);
      border: 1px solid var(--p-content-border-color);
      overflow-y: auto;
      overflow-x: hidden;
      padding: 0.5rem 0;
      z-index: 1000;
      transition: transform 0.3s ease, opacity 0.3s ease;
    }

    /* Скроллбар */
    .layout-sidebar::-webkit-scrollbar {
      width: 6px;
    }

    .layout-sidebar::-webkit-scrollbar-track {
      background: transparent;
    }

    .layout-sidebar::-webkit-scrollbar-thumb {
      background-color: var(--p-content-border-color);
      border-radius: 3px;
    }

    .layout-sidebar::-webkit-scrollbar-thumb:hover {
      background-color: var(--p-text-muted-color);
    }

    /* Mobile */
    @media (max-width: 991px) {
      .layout-sidebar {
        top: 4rem;
        left: 0;
        width: 100%;
        max-width: 280px;
        height: calc(100vh - 4rem);
        border-radius: 0;
        border-left: none;
        border-top: none;
        border-bottom: none;
      }
    }
  `,
})
export class SidebarComponent {
  /** Элементы меню */
  menuItems = input<MenuItem[]>([]);
}