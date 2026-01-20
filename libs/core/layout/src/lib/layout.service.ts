import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ThemeService } from '@piloman/core/theme';

import { LayoutState, DEFAULT_LAYOUT_STATE, MOBILE_BREAKPOINT } from './layout.models';

/**
 * Сервис управления состоянием layout.
 * Отвечает за:
 * - Состояние sidebar (открыт/закрыт)
 * - Режимы меню (static/overlay)
 * - Адаптивность (mobile/desktop)
 * - Панель конфигуратора
 */
@Injectable({ providedIn: 'root' })
export class LayoutService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly themeService = inject(ThemeService);

  /** Состояние layout */
  private readonly _state = signal<LayoutState>(DEFAULT_LAYOUT_STATE);

  /** Публичный readonly доступ к состоянию */
  readonly state = this._state.asReadonly();

  /** Computed: overlay режим меню (из ThemeService) */
  readonly isOverlay = computed(() => this.themeService.menuMode() === 'overlay');

  /** Computed: static режим меню */
  readonly isStatic = computed(() => this.themeService.menuMode() === 'static');

  /** Computed: sidebar активен (виден) */
  readonly isSidebarActive = computed(() => {
    const state = this._state();
    return state.overlayMenuActive || state.staticMenuMobileActive;
  });

  /** Computed: desktop sidebar скрыт (только для static mode) */
  readonly isDesktopSidebarInactive = computed(() => this._state().staticMenuDesktopInactive);

  /** Computed: конфигуратор открыт */
  readonly isConfigSidebarVisible = computed(() => this._state().configSidebarVisible);

  /** Computed: CSS классы для layout-wrapper */
  readonly containerClass = computed(() => {
    const state = this._state();
    const menuMode = this.themeService.menuMode();

    return {
      'layout-overlay': menuMode === 'overlay',
      'layout-static': menuMode === 'static',
      'layout-static-inactive': state.staticMenuDesktopInactive && menuMode === 'static',
      'layout-overlay-active': state.overlayMenuActive,
      'layout-mobile-active': state.staticMenuMobileActive,
    };
  });

  /**
   * Переключает видимость меню.
   * Поведение зависит от режима (static/overlay) и размера экрана.
   */
  toggleMenu(): void {
    if (this.isDesktop()) {
      if (this.isOverlay()) {
        this._state.update((s) => ({
          ...s,
          overlayMenuActive: !s.overlayMenuActive,
        }));
      } else {
        // Static mode на desktop - скрываем/показываем sidebar
        this._state.update((s) => ({
          ...s,
          staticMenuDesktopInactive: !s.staticMenuDesktopInactive,
        }));
      }
    } else {
      // Мобильный режим - всегда overlay поведение
      this._state.update((s) => ({
        ...s,
        staticMenuMobileActive: !s.staticMenuMobileActive,
      }));
    }
  }

  /**
   * Скрывает overlay меню.
   * Вызывается при клике на mask или при навигации.
   */
  hideOverlayMenu(): void {
    this._state.update((s) => ({
      ...s,
      overlayMenuActive: false,
      staticMenuMobileActive: false,
    }));
  }

  /**
   * Показывает панель конфигуратора.
   */
  showConfigSidebar(): void {
    this._state.update((s) => ({
      ...s,
      configSidebarVisible: true,
    }));
  }

  /**
   * Скрывает панель конфигуратора.
   */
  hideConfigSidebar(): void {
    this._state.update((s) => ({
      ...s,
      configSidebarVisible: false,
    }));
  }

  /**
   * Переключает панель конфигуратора.
   */
  toggleConfigSidebar(): void {
    this._state.update((s) => ({
      ...s,
      configSidebarVisible: !s.configSidebarVisible,
    }));
  }

  /**
   * Устанавливает hover состояние меню.
   */
  setMenuHover(active: boolean): void {
    this._state.update((s) => ({
      ...s,
      menuHoverActive: active,
    }));
  }

  /**
   * Обработчик клика на элемент меню.
   * Скрывает overlay меню на мобилке после выбора.
   */
  onMenuItemClick(): void {
    if (!this.isDesktop()) {
      this.hideOverlayMenu();
    }
  }

  /**
   * Проверяет, является ли текущий размер экрана desktop.
   */
  isDesktop(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return true; // На сервере считаем как desktop
    }
    return window.innerWidth >= MOBILE_BREAKPOINT;
  }

  /**
   * Сбрасывает состояние layout к дефолтному.
   */
  resetState(): void {
    this._state.set(DEFAULT_LAYOUT_STATE);
  }
}