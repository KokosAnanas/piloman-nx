import { Component, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { RippleModule } from 'primeng/ripple';

import { MenuItem } from '../../layout.models';
import { LayoutService } from '../../layout.service';

/**
 * Компонент элемента меню.
 * Поддерживает:
 * - Вложенные элементы с анимацией раскрытия
 * - RouterLink навигацию
 * - Внешние ссылки
 * - Иконки и бейджи
 */
@Component({
  selector: 'piloman-menu-item',
  standalone: true,
  imports: [CommonModule, RouterModule, RippleModule],
  template: `
    @if (!item().separator) {
      @if (item().routerLink && !item().items) {
        <!-- Пункт с роутером -->
        <a
          class="menu-item"
          [routerLink]="item().routerLink"
          routerLinkActive="active"
          [routerLinkActiveOptions]="{ exact: true }"
          pRipple
          (click)="onItemClick($event)"
        >
          @if (item().icon) {
            <i [class]="item().icon + ' menu-item-icon'"></i>
          }
          <span class="menu-item-label">{{ item().label }}</span>
          @if (item().badge) {
            <span class="menu-item-badge" [class]="item().badgeClass">{{ item().badge }}</span>
          }
        </a>
      } @else if (item().url) {
        <!-- Внешняя ссылка -->
        <a
          class="menu-item"
          [href]="item().url"
          [target]="item().target || '_blank'"
          pRipple
        >
          @if (item().icon) {
            <i [class]="item().icon + ' menu-item-icon'"></i>
          }
          <span class="menu-item-label">{{ item().label }}</span>
          <i class="pi pi-external-link menu-item-external"></i>
        </a>
      } @else if (item().items && item().items!.length > 0) {
        <!-- Раскрывающееся подменю -->
        <a
          class="menu-item"
          [class.active]="expanded()"
          pRipple
          (click)="toggleSubmenu($event)"
        >
          @if (item().icon) {
            <i [class]="item().icon + ' menu-item-icon'"></i>
          }
          <span class="menu-item-label">{{ item().label }}</span>
          <i class="pi pi-chevron-down menu-item-toggle" [class.rotated]="expanded()"></i>
        </a>
        <ul class="menu-submenu" [@submenu]="expanded() ? 'visible' : 'hidden'">
          @for (child of item().items; track child.label) {
            <li>
              <piloman-menu-item [item]="child" [root]="false" />
            </li>
          }
        </ul>
      } @else {
        <!-- Пункт с командой -->
        <a
          class="menu-item"
          pRipple
          (click)="onCommandClick($event)"
        >
          @if (item().icon) {
            <i [class]="item().icon + ' menu-item-icon'"></i>
          }
          <span class="menu-item-label">{{ item().label }}</span>
        </a>
      }
    }
  `,
  styles: `
    :host {
      display: block;
    }

    .menu-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      margin: 0.125rem 0.5rem;
      border-radius: var(--p-content-border-radius);
      color: var(--p-text-color);
      text-decoration: none;
      cursor: pointer;
      transition: background-color 0.2s, color 0.2s;
    }

    .menu-item:hover {
      background-color: var(--p-content-hover-background);
    }

    .menu-item.active {
      background-color: var(--p-primary-color);
      color: var(--p-primary-contrast-color);
    }

    .menu-item.active .menu-item-icon {
      color: var(--p-primary-contrast-color);
    }

    .menu-item-icon {
      font-size: 1.25rem;
      width: 1.25rem;
      text-align: center;
      color: var(--p-text-muted-color);
      transition: color 0.2s;
    }

    .menu-item:hover .menu-item-icon {
      color: var(--p-text-color);
    }

    .menu-item-label {
      flex: 1;
      font-weight: 500;
    }

    .menu-item-badge {
      padding: 0.25rem 0.5rem;
      font-size: 0.75rem;
      font-weight: 600;
      border-radius: 9999px;
      background-color: var(--p-primary-color);
      color: var(--p-primary-contrast-color);
    }

    .menu-item-toggle {
      font-size: 0.875rem;
      transition: transform 0.2s;
    }

    .menu-item-toggle.rotated {
      transform: rotate(-180deg);
    }

    .menu-item-external {
      font-size: 0.75rem;
      opacity: 0.5;
    }

    .menu-submenu {
      list-style: none;
      padding: 0;
      margin: 0;
      overflow: hidden;
    }

    .menu-submenu .menu-item {
      padding-left: 3rem;
    }
  `,
  animations: [
    trigger('submenu', [
      state('hidden', style({ height: '0', opacity: '0' })),
      state('visible', style({ height: '*', opacity: '1' })),
      transition('hidden <=> visible', animate('200ms ease-in-out')),
    ]),
  ],
})
export class MenuItemComponent {
  private readonly layoutService = inject(LayoutService);
  private readonly router = inject(Router);

  /** Элемент меню */
  item = input.required<MenuItem>();

  /** Корневой элемент (не вложенный) */
  root = input<boolean>(true);

  /** Состояние раскрытия подменю */
  expanded = signal(false);

  /**
   * Обработчик клика на пункт с routerLink.
   */
  onItemClick(event: Event): void {
    this.layoutService.onMenuItemClick();
  }

  /**
   * Переключает состояние подменю.
   */
  toggleSubmenu(event: Event): void {
    event.preventDefault();
    this.expanded.update((v) => !v);
  }

  /**
   * Обработчик клика для пункта с командой.
   */
  onCommandClick(event: Event): void {
    const command = this.item().command;
    if (command) {
      command({ originalEvent: event, item: this.item() });
    }
    this.layoutService.onMenuItemClick();
  }
}