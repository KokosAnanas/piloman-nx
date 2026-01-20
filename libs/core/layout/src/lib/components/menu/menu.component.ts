import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MenuItem } from '../../layout.models';
import { MenuItemComponent } from './menu-item.component';

/**
 * Компонент меню навигации.
 * Отображает иерархический список пунктов меню.
 */
@Component({
  selector: 'piloman-menu',
  standalone: true,
  imports: [CommonModule, RouterModule, MenuItemComponent],
  template: `
    <ul class="layout-menu">
      @for (item of items(); track item.label; let i = $index) {
        @if (item.separator) {
          <li class="menu-separator"></li>
        } @else {
          <li>
            @if (item.items && item.items.length > 0) {
              <!-- Группа с подменю -->
              <div class="menu-section">
                <span class="menu-section-label">{{ item.label }}</span>
              </div>
              <ul class="menu-submenu">
                @for (subItem of item.items; track subItem.label) {
                  <piloman-menu-item [item]="subItem" [root]="false" />
                }
              </ul>
            } @else {
              <!-- Обычный пункт меню -->
              <piloman-menu-item [item]="item" [root]="true" />
            }
          </li>
        }
      }
    </ul>
  `,
  styles: `
    .layout-menu {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .menu-separator {
      height: 1px;
      background-color: var(--p-content-border-color);
      margin: 1rem 0;
    }

    .menu-section {
      padding: 0.75rem 1rem 0.5rem;
    }

    .menu-section-label {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--p-text-muted-color);
    }

    .menu-submenu {
      list-style: none;
      padding: 0;
      margin: 0;
    }
  `,
})
export class MenuComponent {
  /** Элементы меню */
  items = input<MenuItem[]>([]);
}