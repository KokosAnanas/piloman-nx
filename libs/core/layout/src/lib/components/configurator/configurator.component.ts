import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';

import { LayoutService } from '../../layout.service';
import {
  ThemeService,
  ThemePreset,
  PrimaryColor,
  SurfaceName,
  MenuMode,
  PRIMARY_COLORS,
  SURFACE_PALETTES,
} from '@piloman/core/theme';

/**
 * Панель конфигуратора темы.
 * Позволяет настраивать:
 * - Пресет (Aura, Lara, Nora)
 * - Primary цвет
 * - Surface палитру
 * - Режим меню (static/overlay)
 * - Dark mode
 */
@Component({
  selector: 'piloman-configurator',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DrawerModule,
    ButtonModule,
    SelectButtonModule,
  ],
  template: `
    <p-drawer
      [visible]="layoutService.isConfigSidebarVisible()"
      (visibleChange)="onVisibleChange($event)"
      position="right"
      [style]="{ width: '20rem' }"
      [modal]="true"
      [dismissible]="true"
      [showCloseIcon]="true"
      header="Настройки темы"
    >
      <div class="config-content">
        <!-- Пресет -->
        <div class="config-section">
          <span class="config-label">Пресет</span>
          <div class="preset-grid">
            @for (preset of presets; track preset) {
              <button
                type="button"
                class="preset-button"
                [class.active]="themeService.preset() === preset"
                (click)="onPresetChange(preset)"
              >
                {{ preset }}
              </button>
            }
          </div>
        </div>

        <!-- Primary цвет -->
        <div class="config-section">
          <span class="config-label">Primary цвет</span>
          <div class="color-grid">
            @for (color of primaryColors; track color.name) {
              <button
                type="button"
                class="color-button"
                [class.active]="themeService.primary() === color.name"
                [style.background-color]="color.palette[500]"
                [title]="color.name"
                (click)="onPrimaryChange(color.name)"
              >
                @if (themeService.primary() === color.name) {
                  <i class="pi pi-check"></i>
                }
              </button>
            }
            <!-- Noir (monochrome) -->
            <button
              type="button"
              class="color-button noir"
              [class.active]="themeService.primary() === 'noir'"
              title="noir"
              (click)="onPrimaryChange('noir')"
            >
              @if (themeService.primary() === 'noir') {
                <i class="pi pi-check"></i>
              }
            </button>
          </div>
        </div>

        <!-- Surface палитра -->
        <div class="config-section">
          <span class="config-label">Surface палитра</span>
          <div class="surface-grid">
            @for (surface of surfacePalettes; track surface.name) {
              <button
                type="button"
                class="surface-button"
                [class.active]="themeService.surface() === surface.name"
                [title]="surface.name"
                (click)="onSurfaceChange(surface.name)"
              >
                <span
                  class="surface-preview"
                  [style.background]="getSurfaceGradient(surface)"
                ></span>
              </button>
            }
          </div>
        </div>

        <!-- Режим меню -->
        <div class="config-section">
          <span class="config-label">Режим меню</span>
          <p-selectButton
            [options]="menuModeOptions"
            [ngModel]="themeService.menuMode()"
            (ngModelChange)="onMenuModeChange($event)"
            optionLabel="label"
            optionValue="value"
            [allowEmpty]="false"
            styleClass="w-full"
          />
        </div>

        <!-- Dark mode -->
        <div class="config-section">
          <span class="config-label">Тема</span>
          <p-selectButton
            [options]="themeOptions"
            [ngModel]="themeService.darkMode()"
            (ngModelChange)="onDarkModeChange($event)"
            optionLabel="label"
            optionValue="value"
            [allowEmpty]="false"
            styleClass="w-full"
          />
        </div>

        <!-- Сброс -->
        <div class="config-section">
          <button
            pButton
            type="button"
            label="Сбросить настройки"
            icon="pi pi-refresh"
            severity="secondary"
            [outlined]="true"
            class="w-full"
            (click)="onReset()"
          ></button>
        </div>
      </div>
    </p-drawer>
  `,
  styles: `
    .config-content {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      padding: 0.5rem;
    }

    .config-section {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .config-label {
      font-weight: 600;
      font-size: 0.875rem;
      color: var(--p-text-color);
    }

    /* Preset buttons */
    .preset-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.5rem;
    }

    .preset-button {
      padding: 0.5rem 1rem;
      border: 1px solid var(--p-content-border-color);
      border-radius: var(--p-content-border-radius);
      background-color: var(--p-content-background);
      color: var(--p-text-color);
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }

    .preset-button:hover {
      border-color: var(--p-primary-color);
    }

    .preset-button.active {
      background-color: var(--p-primary-color);
      border-color: var(--p-primary-color);
      color: var(--p-primary-contrast-color);
    }

    /* Color buttons */
    .color-grid {
      display: grid;
      grid-template-columns: repeat(8, 1fr);
      gap: 0.375rem;
    }

    .color-button {
      width: 1.75rem;
      height: 1.75rem;
      border-radius: 50%;
      border: 2px solid transparent;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s, border-color 0.2s;
    }

    .color-button:hover {
      transform: scale(1.1);
    }

    .color-button.active {
      border-color: var(--p-text-color);
    }

    .color-button i {
      font-size: 0.75rem;
      color: white;
    }

    .color-button.noir {
      background: linear-gradient(135deg, #1e1e1e 0%, #4a4a4a 100%);
    }

    .color-button.noir i {
      color: white;
    }

    /* Surface buttons */
    .surface-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.5rem;
    }

    .surface-button {
      padding: 0;
      height: 2.5rem;
      border: 2px solid var(--p-content-border-color);
      border-radius: var(--p-content-border-radius);
      background: transparent;
      cursor: pointer;
      overflow: hidden;
      transition: border-color 0.2s;
    }

    .surface-button:hover {
      border-color: var(--p-primary-color);
    }

    .surface-button.active {
      border-color: var(--p-primary-color);
      border-width: 2px;
    }

    .surface-preview {
      display: block;
      width: 100%;
      height: 100%;
    }
  `,
})
export class ConfiguratorComponent {
  readonly layoutService = inject(LayoutService);
  readonly themeService = inject(ThemeService);

  readonly presets: ThemePreset[] = ['Aura', 'Lara', 'Nora'];
  readonly primaryColors = PRIMARY_COLORS;
  readonly surfacePalettes = SURFACE_PALETTES;

  readonly menuModeOptions = [
    { label: 'Static', value: 'static' as MenuMode },
    { label: 'Overlay', value: 'overlay' as MenuMode },
  ];

  readonly themeOptions = [
    { label: 'Светлая', value: false },
    { label: 'Тёмная', value: true },
  ];

  onVisibleChange(visible: boolean): void {
    if (!visible) {
      this.layoutService.hideConfigSidebar();
    }
  }

  onPresetChange(preset: ThemePreset): void {
    this.themeService.setPreset(preset);
  }

  onPrimaryChange(color: PrimaryColor): void {
    this.themeService.setPrimary(color);
  }

  onSurfaceChange(surface: SurfaceName): void {
    this.themeService.setSurface(surface);
  }

  onMenuModeChange(mode: MenuMode): void {
    this.themeService.setMenuMode(mode);
  }

  onDarkModeChange(darkMode: boolean): void {
    this.themeService.setDarkMode(darkMode);
  }

  onReset(): void {
    this.themeService.resetToDefaults();
  }

  getSurfaceGradient(surface: { palette: Record<string, string> }): string {
    return `linear-gradient(to right, ${surface.palette[500]} 0%, ${surface.palette[300]} 50%, ${surface.palette[100]} 100%)`;
  }
}
