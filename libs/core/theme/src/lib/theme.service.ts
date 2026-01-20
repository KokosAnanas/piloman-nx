import { Injectable, signal, computed, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { $t, updateSurfacePalette } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import Lara from '@primeuix/themes/lara';
import Nora from '@primeuix/themes/nora';

import {
  ThemeConfig,
  ThemePreset,
  PrimaryColor,
  SurfaceName,
  MenuMode,
  DEFAULT_THEME_CONFIG,
  THEME_STORAGE_KEY,
  DARK_MODE_CLASS,
  PRIMARY_COLORS,
  SURFACE_PALETTES,
} from './theme.models';

/**
 * Сервис управления темой приложения.
 * Поддерживает:
 * - Переключение пресетов (Aura, Lara, Nora)
 * - Primary и Surface цвета
 * - Dark/Light mode
 * - Persistence в localStorage
 *
 * @see https://primeng.org/theming/styled
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);

  /** Маппинг пресетов на объекты из @primeuix/themes */
  private readonly presets = {
    Aura,
    Lara,
    Nora,
  } as const;

  /** Текущая конфигурация темы (signal) */
  private readonly _config = signal<ThemeConfig>(this.loadConfig());

  /** Публичный readonly доступ к конфигурации */
  readonly config = this._config.asReadonly();

  /** Computed signals для удобного доступа к отдельным свойствам */
  readonly preset = computed(() => this._config().preset);
  readonly primary = computed(() => this._config().primary);
  readonly surface = computed(() => this._config().surface);
  readonly darkMode = computed(() => this._config().darkMode);
  readonly menuMode = computed(() => this._config().menuMode);

  /** Проверка overlay режима меню */
  readonly isOverlayMenu = computed(() => this._config().menuMode === 'overlay');

  constructor() {
    // Автосохранение при изменении конфигурации
    effect(() => {
      const config = this._config();
      this.saveConfig(config);
    });

    // Применяем начальную тему при создании сервиса
    this.applyTheme();
  }

  /**
   * Загружает конфигурацию из localStorage или возвращает дефолтную.
   */
  private loadConfig(): ThemeConfig {
    if (!isPlatformBrowser(this.platformId)) {
      return DEFAULT_THEME_CONFIG;
    }

    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<ThemeConfig>;
        // Мержим с дефолтами на случай, если структура изменилась
        return { ...DEFAULT_THEME_CONFIG, ...parsed };
      }
    } catch (e) {
      console.warn('[ThemeService] Ошибка загрузки конфигурации из localStorage:', e);
    }

    return DEFAULT_THEME_CONFIG;
  }

  /**
   * Сохраняет конфигурацию в localStorage.
   */
  private saveConfig(config: ThemeConfig): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(config));
    } catch (e) {
      console.warn('[ThemeService] Ошибка сохранения конфигурации в localStorage:', e);
    }
  }

  /**
   * Переключает тёмный режим.
   */
  toggleDarkMode(): void {
    this._config.update((c) => ({ ...c, darkMode: !c.darkMode }));
    this.applyDarkMode();
  }

  /**
   * Устанавливает dark mode напрямую.
   */
  setDarkMode(enabled: boolean): void {
    if (this._config().darkMode !== enabled) {
      this._config.update((c) => ({ ...c, darkMode: enabled }));
      this.applyDarkMode();
    }
  }

  /**
   * Устанавливает пресет темы.
   */
  setPreset(preset: ThemePreset): void {
    if (this._config().preset !== preset) {
      this._config.update((c) => ({ ...c, preset }));
      this.applyPreset();
    }
  }

  /**
   * Устанавливает primary цвет.
   */
  setPrimary(color: PrimaryColor): void {
    if (this._config().primary !== color) {
      this._config.update((c) => ({ ...c, primary: color }));
      // Используем полную перезагрузку пресета вместо updatePreset(),
      // т.к. updatePreset() из @primeuix/themes работает некорректно
      // при повторных вызовах (цвет не меняется)
      this.applyPreset();
    }
  }

  /**
   * Устанавливает surface палитру.
   */
  setSurface(surface: SurfaceName | null): void {
    if (this._config().surface !== surface) {
      this._config.update((c) => ({ ...c, surface }));
      this.applySurface();
    }
  }

  /**
   * Устанавливает режим меню.
   */
  setMenuMode(mode: MenuMode): void {
    if (this._config().menuMode !== mode) {
      this._config.update((c) => ({ ...c, menuMode: mode }));
    }
  }

  /**
   * Применяет всю тему целиком.
   * Вызывается при инициализации и при смене пресета.
   */
  private applyTheme(): void {
    this.applyDarkMode();
    this.applyPreset();
  }

  /**
   * Применяет dark mode класс к document.
   */
  private applyDarkMode(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const { darkMode } = this._config();

    // Используем View Transitions API если доступен (плавный переход)
    if ((document as any).startViewTransition) {
      (document as any).startViewTransition(() => {
        this.toggleDarkModeClass(darkMode);
      });
    } else {
      this.toggleDarkModeClass(darkMode);
    }
  }

  private toggleDarkModeClass(darkMode: boolean): void {
    if (darkMode) {
      document.documentElement.classList.add(DARK_MODE_CLASS);
    } else {
      document.documentElement.classList.remove(DARK_MODE_CLASS);
    }
  }

  /**
   * Применяет пресет и все связанные настройки.
   */
  private applyPreset(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const config = this._config();
    const preset = this.presets[config.preset];
    const surfacePalette = this.getSurfacePalette();

    // Применяем пресет через @primeuix/themes API
    // @see https://primeng.org/theming/styled
    $t()
      .preset(preset)
      .preset(this.getPresetExtension())
      .surfacePalette(surfacePalette)
      .use({ useDefaultOptions: true });
  }

  /**
   * Применяет только surface палитру.
   */
  private applySurface(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const surfacePalette = this.getSurfacePalette();
    if (surfacePalette) {
      updateSurfacePalette(surfacePalette);
    }
  }

  /**
   * Возвращает расширение пресета с primary цветом.
   * Для "noir" создаёт monochrome тему на основе surface.
   *
   * @returns Объект расширения пресета, совместимый с @primeuix/themes API
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private getPresetExtension(): any {
    const { primary } = this._config();

    if (primary === 'noir') {
      // Noir - специальный monochrome режим
      return {
        semantic: {
          primary: {
            50: '{surface.50}',
            100: '{surface.100}',
            200: '{surface.200}',
            300: '{surface.300}',
            400: '{surface.400}',
            500: '{surface.500}',
            600: '{surface.600}',
            700: '{surface.700}',
            800: '{surface.800}',
            900: '{surface.900}',
            950: '{surface.950}',
          },
          colorScheme: {
            light: {
              primary: {
                color: '{surface.950}',
                contrastColor: '#ffffff',
                hoverColor: '{surface.800}',
                activeColor: '{surface.700}',
              },
              highlight: {
                background: '{surface.950}',
                focusBackground: '{surface.700}',
                color: '#ffffff',
                focusColor: '#ffffff',
              },
            },
            dark: {
              primary: {
                color: '{surface.50}',
                contrastColor: '{surface.950}',
                hoverColor: '{surface.200}',
                activeColor: '{surface.300}',
              },
              highlight: {
                background: '{surface.50}',
                focusBackground: '{surface.300}',
                color: '{surface.950}',
                focusColor: '{surface.950}',
              },
            },
          },
        },
      };
    }

    // Стандартный primary цвет
    return {
      semantic: {
        primary: {
          50: `{${primary}.50}`,
          100: `{${primary}.100}`,
          200: `{${primary}.200}`,
          300: `{${primary}.300}`,
          400: `{${primary}.400}`,
          500: `{${primary}.500}`,
          600: `{${primary}.600}`,
          700: `{${primary}.700}`,
          800: `{${primary}.800}`,
          900: `{${primary}.900}`,
          950: `{${primary}.950}`,
        },
      },
    };
  }

  /**
   * Возвращает surface палитру для текущих настроек.
   */
  private getSurfacePalette(): object | undefined {
    const { surface } = this._config();

    if (!surface) {
      return undefined;
    }

    const surfaceInfo = SURFACE_PALETTES.find((s) => s.name === surface);
    return surfaceInfo?.palette;
  }

  /**
   * Получить информацию о primary цвете для UI.
   */
  getPrimaryColors() {
    return PRIMARY_COLORS;
  }

  /**
   * Получить информацию о surface палитрах для UI.
   */
  getSurfacePalettes() {
    return SURFACE_PALETTES;
  }

  /**
   * Получить список доступных пресетов.
   */
  getPresets(): ThemePreset[] {
    return ['Aura', 'Lara', 'Nora'];
  }

  /**
   * Получить список режимов меню.
   */
  getMenuModes(): MenuMode[] {
    return ['static', 'overlay'];
  }

  /**
   * Сбросить настройки к дефолтным.
   */
  resetToDefaults(): void {
    this._config.set(DEFAULT_THEME_CONFIG);
    this.applyTheme();
  }
}
