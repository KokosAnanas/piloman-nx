/**
 * libs/core/layout - Система layout приложения
 *
 * Публичный API:
 * - LayoutComponent - главный shell компонент
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
export { LayoutComponent } from './lib/components/layout/layout.component';
export { TopbarComponent } from './lib/components/topbar/topbar.component';
export { SidebarComponent } from './lib/components/sidebar/sidebar.component';
export { FooterComponent } from './lib/components/footer/footer.component';
export { ConfiguratorComponent } from './lib/components/configurator/configurator.component';
export { MenuComponent } from './lib/components/menu/menu.component';
export { MenuItemComponent } from './lib/components/menu/menu-item.component';