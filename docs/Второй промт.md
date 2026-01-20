# Промт: Перенос оформления Sakai (PrimeNG) в наш Nx-monorepo (Angular 21)

## Роль
Ты — senior Frontend архитектор (Angular 21 + Nx monorepo + PrimeNG 21 + TailwindCSS). Твоя задача — перенести **layout и theming-поведение** как в шаблоне Sakai, но **строго в рамках нашей Nx-архитектуры** (apps/* без бизнес-логики, libs per domain, shared/core границы).

## Референсы (посмотри и повтори UX/поведение)
Склонируй/изучи референс-проект и воспроизведи:
- Sakai NG:
  - https://github.com/primefaces/sakai-ng.git
- PrimeNG Styled Theming (presets, токены, darkModeSelector):
  - https://primeng.org/theming/styled

Важно: Sakai использует PrimeNG **styled-mode** c пресетами Aura/Material/Lara/Nora и переключением **menu mode: static/overlay**, а также UI-конфигуратор (primary/surface/preset). :contentReference[oaicite:0]{index=0}

---

## Что нужно сделать (результат)
Сделай оформление и поведение как в Sakai:

### 1) Layout
- Основной лэйаут приложения:
  - **Sidebar слева**
  - **Header/Topbar сверху**
  - Контент справа/по центру
  - footer внизу после контента
- Поддержать **Menu Mode**:
  - `static` (sidebar постоянно видим на desktop)
  - `overlay` (sidebar поверх контента, выезжает/закрывается)
- Адаптивность: как в админ-шаблоне — корректно на desktop/tablet/mobile.

### 2) Header (Topbar)
Справа в хедере:
- Кнопка **переключения темы Light/Dark** (тоггл)
- Кнопка **Settings/Configurator**:
  - смена **Primary color**
  - смена **Surface color**
  - смена **Preset**: Aura / Material / Lara / Nora
  - смена **Menu Mode**: static / overlay

### 3) Theming на PrimeNG Styled Mode
Используй официальный способ PrimeNG:
- `providePrimeNG({ theme: { preset, options } })`
- Настрой `darkModeSelector` так, чтобы dark-mode был **управляемым классом** (как в доке: переключаем класс на корне документа), а не только `prefers-color-scheme`. :contentReference[oaicite:1]{index=1}
- Переключение preset/primary/surface должно реально менять токены (дизайн-токены), а не “ручной CSS”.

### 4) Persistence
Сохраняй настройки пользователя (dark, preset, primary, surface, menuMode) в `localStorage` и восстанавливай при старте приложения.

---

## Обязательная Nx-архитектура (куда что класть)
Соблюдай правила:

### Apps
- `apps/web` — только composition/root wiring (bootstrap, routes, providePrimeNG, подключение core-сервисов).
- **Никакой бизнес-логики в apps/web**.

### Libs
Размести код так:

- `libs/core/layout/`
  - shell/layout контейнер (LayoutComponent)
  - sidebar/topbar компоненты
  - layout-state (signals store или сервис состояния)
  - menu mode logic, overlay logic

- `libs/core/theme/`
  - ThemeService / ThemeStore (signals)
  - применение preset/primary/surface/darkModeSelector
  - persistence (localStorage)

- `libs/shared/ui/`
  - мелкие UI-обёртки (кнопки, панели), если нужны переиспользуемые штуки
  - **shared не импортирует domain и apps**

Если понадобится отдельный UI для конфигуратора:
- `libs/core/layout/ui-configurator/` (или `libs/core/theme/ui-configurator/`) — но не в apps.

---

## Технические требования
- Angular 21, standalone components
- PrimeNG 21 + PrimeIcons
- TailwindCSS (как в Sakai)
- State: предпочтительно **Angular Signals + Signals Store**, RxJS только для async
- Код должен быть типизирован и аккуратен.

---

## Пошаговые действия (что именно сделать в PR)
1) Создай libs и публичные API:
- `libs/core/layout`
- `libs/core/theme`
- `libs/shared/ui`

2) В `apps/web`:
- Подключи `providePrimeNG()` и базовую конфигурацию theme preset (по умолчанию Aura).
- Подключи глобальный LayoutShell (router outlet внутри контентной области).

3) Реализуй layout как в Sakai:
- LayoutComponent (shell): держит сетку: sidebar + topbar + content + footer
- Sidebar: меню, поведение overlay/static
- Topbar: кнопки theme toggle + settings

4) Реализуй Configurator panel:
- UI-панель настроек (offcanvas/overlay panel)
- Выбор preset / primary / surface / menuMode
- Применение изменений сразу + сохранение в localStorage

5) Реализуй dark-mode:
- По клику переключай класс на `document.documentElement` (например `.app-dark`)
- Укажи этот селектор в `providePrimeNG({ theme: { options: { darkModeSelector }}})` :contentReference[oaicite:2]{index=2}

6) Добавь acceptance criteria + краткую документацию:
- Где менять дефолты
- Как добавить новые primary/surface наборы
- Как работает persistence

---

## Acceptance Criteria (проверка готовности)
- Лэйаут визуально и поведенчески близок к Sakai: sidebar + topbar + responsive.
- Работает:
  - dark/light toggle
  - presets Aura/Material/Lara/Nora :contentReference[oaicite:3]{index=3}
  - primary/surface switches
  - menu mode static/overlay :contentReference[oaicite:4]{index=4}
- Настройки сохраняются и восстанавливаются после перезагрузки.
- Импорты соблюдают Nx module boundaries (shared не тянет domain/apps, домены не мешаются друг с другом).
