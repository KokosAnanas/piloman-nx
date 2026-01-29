/**
 * libs/core/layout - Система layout приложения
 *
 * Публичный API:
 * - Layout - главный shell компонент
 * - LayoutService - сервис управления состоянием layout
 * - Компоненты: Topbar, Sidebar, Footer, Configurator, Menu
 * - Модели и типы
 */

// Сервис
export { LayoutService } from './lib/layout.service';

// Типы (export type для isolatedModules)
export type { LayoutState, MenuItem } from './lib/layout.models';

// Константы
export { DEFAULT_LAYOUT_STATE, MOBILE_BREAKPOINT } from './lib/layout.models';

// Компоненты
export { Layout } from './lib/components/layout/layout';
export { Topbar } from './lib/components/topbar/topbar';
export { Sidebar } from './lib/components/sidebar/sidebar';
export { Footer } from './lib/components/footer/footer';
export { Configurator } from './lib/components/configurator/configurator';
export { Menu } from './lib/components/menu/menu';
export { MenuItemComponent } from './lib/components/menu/menu-item';