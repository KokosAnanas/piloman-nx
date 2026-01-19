# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Проект

**piloman.ru** — веб-приложение для специалистов неразрушающего контроля (НК) сварных соединений. Позволяет оформлять документы/заключения, вести реестры и протоколы.

Общение ведётся только на **русском языке**. В коде пиши пояснительные комментарии со ссылками на официальную документацию.

## Команды

```bash
# Запуск (API + Web параллельно)
pnpm run start

# Запуск по отдельности
pnpm nx serve api          # API: http://localhost:3333/api
pnpm nx serve web          # Web: http://localhost:4200

# Сборка
pnpm nx build api
pnpm nx build web

# Линтинг
pnpm nx lint api
pnpm nx lint web

# Тесты
pnpm nx test api
pnpm nx test web

# MongoDB (Docker)
docker compose up -d       # Запуск
docker compose down        # Остановка
```

## Стек

- **Frontend:** Angular 21 (standalone, Vite), PrimeNG 21, TailwindCSS, Signals
- **Backend:** NestJS 11 (REST), Mongoose
- **Database:** MongoDB
- **Package manager:** pnpm
- **Monorepo:** Nx 22

## Архитектура (Nx libs per domain)

```
apps/
  web/              # Angular frontend (только wiring, без бизнес-логики)
  api/              # NestJS backend (только wiring + domain modules)

libs/
  <domain>/         # Доменные библиотеки (например: welds, documents, registry)
    models/         # Типы, интерфейсы, DTO
    data-access/    # Angular HTTP клиенты (WeldsApiService)
    feature-*/      # Страницы/компоненты (WeldsComponent)
    store/          # Signals Store (состояние)
    ui/             # Доменные UI компоненты
  shared/           # Общие утилиты, типы (НЕ импортирует доменные либы)
  core/             # Auth, guards, interceptors, layout
```

## Правила модульности

1. **apps/** не содержит бизнес-логики — только composition/root wiring
2. **libs/shared/** не импортирует доменные либы и apps (зависимости только "вниз")
3. Доменные либы могут зависеть от shared и core, но НЕ друг от друга напрямую
4. Импорты только через публичные API (`index.ts`), без deep-imports
5. Состояние — через **Signals Store**, RxJS только для асинхронных потоков

## Path aliases (tsconfig.base.json)

```
@piloman/welds/models        → libs/welds/models/src/index.ts
@piloman/welds/data-access   → libs/welds/data-access/src/index.ts
@piloman/welds/feature-welds → libs/welds/feature-welds/src/index.ts
```

## Backend: добавление нового домена

1. Создать модуль в `apps/api/src/app/<domain>/`
2. Структура: `schemas/`, `dto/`, `*.module.ts`, `*.controller.ts`, `*.service.ts`
3. Mongoose schema с `toJSON: { virtuals: true, transform }` для преобразования `_id` → `id`
4. Импортировать модуль в `AppModule`

## Frontend: добавление нового домена

1. Создать библиотеки в `libs/<domain>/`:
   - `models/` — типы и DTO
   - `data-access/` — Angular сервис с HttpClient
   - `feature-<name>/` — standalone компонент
2. Добавить path aliases в `tsconfig.base.json`
3. Добавить route в `apps/web/src/app/app.routes.ts` (lazy loading)

## Конфигурация

- `.env` — переменные окружения (MONGODB_URI, PORT)
- `apps/web/proxy.conf.json` — proxy для API в dev режиме
- `docker-compose.yml` — MongoDB для локальной разработки
