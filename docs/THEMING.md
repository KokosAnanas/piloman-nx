# Система темизации piloman.ru

Система темизации основана на **PrimeNG v21 Styled Mode** с поддержкой пресетов Aura/Lara/Nora и динамического переключения тем.

## Архитектура

```
libs/
  core/
    theme/                    # Система темизации
      src/lib/
        theme.models.ts       # Типы, интерфейсы, константы
        theme.service.ts      # ThemeService - управление темой
      src/index.ts            # Публичный API

    layout/                   # Layout компоненты
      src/lib/
        layout.models.ts      # Типы для layout
        layout.service.ts     # LayoutService - состояние layout
        components/
          layout/             # LayoutComponent (shell)
          topbar/             # TopbarComponent
          sidebar/            # SidebarComponent
          footer/             # FooterComponent
          menu/               # MenuComponent + MenuItemComponent
          configurator/       # ConfiguratorComponent (панель настроек)
      src/index.ts            # Публичный API
```

## Использование

### Импорт в приложении

```typescript
// app.config.ts
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { DARK_MODE_CLASS } from '@piloman/core/theme';

providePrimeNG({
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: `.${DARK_MODE_CLASS}`, // '.app-dark'
    },
  },
})
```

```typescript
// app.ts
import { LayoutComponent, MenuItem } from '@piloman/core/layout';

@Component({
  imports: [RouterModule, LayoutComponent],
  template: `
    <piloman-layout [menuItems]="menuItems">
      <router-outlet></router-outlet>
    </piloman-layout>
  `,
})
export class App {
  menuItems: MenuItem[] = [
    {
      label: 'Главная',
      items: [
        { label: 'Дашборд', icon: 'pi pi-home', routerLink: '/' },
      ],
    },
  ];
}
```

## Конфигурация темы

### ThemeConfig

```typescript
interface ThemeConfig {
  preset: 'Aura' | 'Lara' | 'Nora';     // Пресет PrimeNG
  primary: PrimaryColor;                 // Primary цвет (16 цветов + 'noir')
  surface: SurfaceName | null;           // Surface палитра (8 вариантов)
  darkMode: boolean;                     // Тёмная тема
  menuMode: 'static' | 'overlay';        // Режим меню
}
```

### Дефолтные значения

```typescript
const DEFAULT_THEME_CONFIG: ThemeConfig = {
  preset: 'Aura',
  primary: 'emerald',
  surface: null,        // Используется дефолтная палитра пресета
  darkMode: false,
  menuMode: 'static',
};
```

## ThemeService API

```typescript
import { ThemeService } from '@piloman/core/theme';

@Component({...})
class MyComponent {
  private themeService = inject(ThemeService);

  // Signals (readonly)
  config = this.themeService.config;         // Полная конфигурация
  preset = this.themeService.preset;         // Текущий пресет
  primary = this.themeService.primary;       // Primary цвет
  surface = this.themeService.surface;       // Surface палитра
  darkMode = this.themeService.darkMode;     // Dark mode
  menuMode = this.themeService.menuMode;     // Режим меню
  isOverlayMenu = this.themeService.isOverlayMenu; // computed

  // Методы изменения
  this.themeService.setPreset('Lara');
  this.themeService.setPrimary('blue');
  this.themeService.setSurface('zinc');
  this.themeService.setDarkMode(true);
  this.themeService.toggleDarkMode();
  this.themeService.setMenuMode('overlay');
  this.themeService.resetToDefaults();

  // Данные для UI конфигуратора
  this.themeService.getPrimaryColors();      // PrimaryColorInfo[]
  this.themeService.getSurfacePalettes();    // SurfaceInfo[]
  this.themeService.getPresets();            // ThemePreset[]
  this.themeService.getMenuModes();          // MenuMode[]
}
```

## Persistence

Настройки автоматически сохраняются в `localStorage` под ключом `piloman-theme-config`.

При загрузке приложения:
1. ThemeService читает сохранённые настройки из localStorage
2. Если настройки отсутствуют, используются дефолтные
3. Применяется тема (preset, primary, surface, darkMode)

При изменении настроек:
1. Signal обновляется
2. Effect автоматически сохраняет в localStorage
3. Применяются изменения темы

## Добавление новых primary цветов

В `libs/core/theme/src/lib/theme.models.ts`:

1. Добавить в тип `PrimaryColor`:
```typescript
export type PrimaryColor =
  | 'emerald'
  | 'green'
  // ...
  | 'my-color'; // Новый цвет
```

2. Добавить в массив `PRIMARY_COLORS`:
```typescript
export const PRIMARY_COLORS: PrimaryColorInfo[] = [
  // ...
  {
    name: 'my-color',
    palette: {
      50: '#...',
      // ... все оттенки от 50 до 950
    },
  },
];
```

## Добавление новых surface палитр

В `libs/core/theme/src/lib/theme.models.ts`:

1. Добавить в тип `SurfaceName`:
```typescript
export type SurfaceName =
  | 'slate'
  // ...
  | 'my-surface';
```

2. Добавить в массив `SURFACE_PALETTES`:
```typescript
export const SURFACE_PALETTES: SurfaceInfo[] = [
  // ...
  {
    name: 'my-surface',
    palette: {
      0: '#ffffff',
      50: '#...',
      // ... все оттенки
    },
  },
];
```

## Dark Mode

Dark mode реализован через CSS класс `.app-dark` на `<html>` элементе.

### Как работает

1. `providePrimeNG` настроен с `darkModeSelector: '.app-dark'`
2. PrimeNG генерирует стили для light и dark mode
3. ThemeService добавляет/удаляет класс `.app-dark` на `document.documentElement`
4. Используется View Transitions API для плавного перехода (если поддерживается)

### CSS переменные

```scss
:root {
  --surface-ground: var(--p-surface-100);
  // ... light mode
}

:root.app-dark {
  --surface-ground: var(--p-surface-950);
  // ... dark mode
}
```

## Режимы меню

### Static Mode
- Sidebar постоянно виден на desktop (width >= 992px)
- Контент сдвинут вправо (`margin-left: 20rem`)
- Можно скрыть sidebar кнопкой (hamburger в topbar)

### Overlay Mode
- Sidebar скрыт по умолчанию
- Выезжает поверх контента при клике на hamburger
- Показывается mask (затемнение) за sidebar

### Mobile (width < 992px)
- Всегда overlay поведение независимо от настройки
- Hamburger кнопка всегда видна

## LayoutService API

```typescript
import { LayoutService } from '@piloman/core/layout';

@Component({...})
class MyComponent {
  private layoutService = inject(LayoutService);

  // Signals (readonly)
  state = this.layoutService.state;                    // LayoutState
  isOverlay = this.layoutService.isOverlay;            // computed
  isStatic = this.layoutService.isStatic;              // computed
  isSidebarActive = this.layoutService.isSidebarActive; // computed
  containerClass = this.layoutService.containerClass;   // computed CSS классы

  // Методы
  this.layoutService.toggleMenu();           // Переключить sidebar
  this.layoutService.hideOverlayMenu();      // Скрыть overlay/mobile sidebar
  this.layoutService.showConfigSidebar();    // Показать конфигуратор
  this.layoutService.hideConfigSidebar();    // Скрыть конфигуратор
  this.layoutService.toggleConfigSidebar();  // Переключить конфигуратор
  this.layoutService.onMenuItemClick();      // Обработчик клика на пункт меню
  this.layoutService.isDesktop();            // Проверка размера экрана
}
```

## CSS классы layout

| Класс | Описание |
|-------|----------|
| `.layout-wrapper` | Корневой контейнер |
| `.layout-static` | Static режим меню |
| `.layout-overlay` | Overlay режим меню |
| `.layout-static-inactive` | Static menu скрыт |
| `.layout-overlay-active` | Overlay menu открыт |
| `.layout-mobile-active` | Mobile menu открыт |
| `.layout-topbar` | Верхняя панель |
| `.layout-sidebar` | Боковая панель |
| `.layout-main-container` | Контейнер контента |
| `.layout-main` | Область контента |
| `.layout-footer` | Футер |
| `.layout-mask` | Overlay затемнение |

## Acceptance Criteria

- [x] Layout визуально похож на Sakai: sidebar + topbar + responsive
- [x] Dark/light toggle работает
- [x] Presets Aura/Lara/Nora переключаются
- [x] Primary/surface цвета переключаются
- [x] Menu mode static/overlay работает
- [x] Настройки сохраняются в localStorage
- [x] Импорты соблюдают Nx module boundaries