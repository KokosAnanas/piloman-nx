/**
 * libs/core/theme - Система темизации приложения
 *
 * Публичный API:
 * - ThemeService - сервис управления темой
 * - Модели и константы для темизации
 */

// Сервис
export { ThemeService } from './lib/theme.service';

// Типы (export type для isolatedModules)
export type {
  ThemeConfig,
  ThemePreset,
  PrimaryColor,
  SurfaceName,
  MenuMode,
  PrimaryColorInfo,
  SurfaceInfo,
} from './lib/theme.models';

// Константы
export {
  DEFAULT_THEME_CONFIG,
  THEME_STORAGE_KEY,
  DARK_MODE_CLASS,
  PRIMARY_COLORS,
  SURFACE_PALETTES,
} from './lib/theme.models';