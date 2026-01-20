/**
 * Модели и типы для системы layout приложения.
 * Основано на структуре Sakai-NG.
 */

/** Состояние layout (UI состояние, не персистится) */
export interface LayoutState {
  /** Sidebar скрыт на desktop (только для static mode) */
  staticMenuDesktopInactive: boolean;
  /** Overlay меню открыто */
  overlayMenuActive: boolean;
  /** Sidebar открыт на мобилке */
  staticMenuMobileActive: boolean;
  /** Панель конфигуратора видима */
  configSidebarVisible: boolean;
  /** Hover состояние меню */
  menuHoverActive: boolean;
}

/** Значения по умолчанию для состояния layout */
export const DEFAULT_LAYOUT_STATE: LayoutState = {
  staticMenuDesktopInactive: false,
  overlayMenuActive: false,
  staticMenuMobileActive: false,
  configSidebarVisible: false,
  menuHoverActive: false,
};

/** Элемент меню навигации */
export interface MenuItem {
  /** Текст метки */
  label: string;
  /** Иконка PrimeIcons (например 'pi pi-home') */
  icon?: string;
  /** Путь роутера */
  routerLink?: string;
  /** Внешняя ссылка */
  url?: string;
  /** Открывать в новом окне */
  target?: string;
  /** Вложенные элементы */
  items?: MenuItem[];
  /** Разделитель */
  separator?: boolean;
  /** Бейдж */
  badge?: string;
  /** CSS класс бейджа */
  badgeClass?: string;
  /** Отключён */
  disabled?: boolean;
  /** Видимость */
  visible?: boolean;
  /** Команда при клике */
  command?: (event: { originalEvent: Event; item: MenuItem }) => void;
}

/** Breakpoint для определения мобильного режима */
export const MOBILE_BREAKPOINT = 992;
