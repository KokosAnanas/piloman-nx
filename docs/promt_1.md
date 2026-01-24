
# PROMPT: Nx (Angular 21 + NestJS + MongoDB) — Домен “Реестр сварных соединений” (welds) по упрощённой схеме libs per domain

Ты — senior full-stack разработчик/архитектор. Работаешь в существующем Nx monorepo (pnpm), где уже частично реализовано:
- `apps/web` — Angular 21 (standalone, Vite)
- `apps/api` — NestJS (REST)
- MongoDB + Mongoose
- PrimeNG 21

Нужно создать домен **“Реестр сварных соединений”**.
Название домена: **`welds`**.

Цель: сделать минимальный вертикальный срез:
1) `models` (типы/DTO)
2) `api` CRUD (NestJS + Mongoose)
3) `data-access` (Angular API client)
4) `web` — простая таблица “Реестр швов” без дизайна (только чтобы работало)

---

## 0) Архитектурные ограничения (обязательные)
- В `apps/web` и `apps/api` **не размещать бизнес-логику домена** — только wiring/подключение.
- Домен живёт в libs:
  - `libs/welds/models`
  - `libs/welds/data-access`
  - `libs/welds/feature-welds`
- `libs/shared/*` НЕ зависит от домена.
- Импорты только через публичные API (`index.ts`), без deep-imports.

---

## 1) Сгенерировать библиотеки домена (Nx)
Создай библиотеки (если их нет) и выставь теги (если в проекте используется enforce-module-boundaries):
- `libs/welds/models`        tags: `scope:welds,type:model`
- `libs/welds/data-access`   tags: `scope:welds,type:data-access`
- `libs/welds/feature-welds` tags: `scope:welds,type:feature`

Если генераторы уже настроены — используй `nx g ...` подходящий для workspace.
После генерации проверь, что у каждой либы есть публичный экспорт в `src/index.ts`.

---

## 2) Models (frontend/shared types) — `libs/welds/models`
Создай типы:

### Основная сущность
`Weld` (стык/шов) — минимальные поля:
- `id: string`
- `weldNumber?: string`     // номер стыка/шва (например "12-45") — ОБЯЗАТЕЛЬНО
- `diameter: number`       // D (мм)
- `thickness1: number`      // S1 (мм)
- `thickness2?: number`      // S2 (мм)
- `qualityLevel: 'A' | 'B' | 'C' ` // уровень качества
- `weldDate?: string`      // ISO date string (или Date, но единообразно)
- `weldingProcess: 'SMAW_GMAW' | 'GTAW' | 'SAW'`         // Способ сварки - 'Ручная дуговая, полуавтоматическая', 'Автоматическая в защитных газах', 'Автоматическая под флюсом', по умолчанию 'Ручная дуговая, полуавтоматическая'
- `weldStatus?: 'draft' | 'in_progress' | 'done'` (enum/union)
- `testMethods: 'VT' | 'UT' | 'RT' | 'MT' | 'PT'`      // ВИК, РК, УЗК, МК, ПВК - какие-то из этих методов, либо несколько из них, либо все или вообще без контроля. Массив методов НК, default: []
- `conclusion?: 'OK' | 'REPAIR' | 'CUT' ` // 'годен' | 'ремонт' | 'вырезать' (По умолчанию не один из них, т.е. контроля не было)
- `joint?: 'BUTT' | 'FILLET_LAP'`  //   Тип сварного соединения, здесь два варианта 'Стыковое' или 'Угловое, нахлёсточное'. По умолчанию 'Стыковое'
- `notes?: string`;

### DTO
- `CreateWeldDto` 
- required: weldNumber, diameter, thickness1, qualityLevel
- `UpdateWeldDto` (Partial<Create...>)
- `WeldListQuery` (опционально): `page`, `limit`, `search`

Экспортируй всё из `libs/welds/models/src/index.ts`.

---

## 3) Backend: CRUD (NestJS + Mongoose)
Создай ресурс/модуль для сущности: apps/api/src/app/welds/*
- `welds.module.ts`
- `welds.controller.ts`
- `welds.service.ts`
- `schemas/weld.schema.ts`
- `dto/create-weld.dto.ts`
- `dto/update-weld.dto.ts`

### Endpoints

- `GET    /api/welds`  
  Возвращает массив `Weld[]` (можно без пагинации на первом шаге).
  Опционально поддержи `?search=...` (по weldNumber, case-insensitive)

- `GET    /api/welds/:id`
- `POST   /api/welds`
- `PATCH  /api/welds/:id`
- `DELETE /api/welds/:id`

### Mongoose schema
- Поля соответствуют `Weld`.
- `timestamps: true`
- Индекс: weldNumber (хотя бы index: true)
- В ответах наружу возвращай `id` вместо `_id` (преобразование/виртуальное поле/mapper).
- “сделать единообразно через schema.set('toJSON', { virtuals: true, transform }) или virtual id”, чтобы я не сделал “костыль в контроллере”

### Валидация DTO (обязательно)

- Используй class-validator/class-transformer
- Включи глобальный ValidationPipe({ whitelist: true, transform: true })

### Подключение MongoDB
Подключи:
- добавь `ConfigModule` + `MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/piloman')`
- задай global prefix `/api` (если не задан)
- Angular dev proxy → API

---

## 4) Frontend data-access — `libs/welds/data-access`
Сделай Angular сервис-клиент:
- `WeldApi` (или `WeldsApi`)
- Используй `HttpClient`
- `baseUrl` бери из environment (например `environment.apiUrl`), либо константой на первом шаге (но лучше environment)

Методы:
- `list(query?: WeldListQuery): Observable<Weld[]>`
- `get(id: string): Observable<Weld>`
- `create(dto: CreateWeldDto): Observable<Weld>`
- `update(id: string, dto: UpdateWeldDto): Observable<Weld>`
- `remove(id: string): Observable<void>`

Импортируй типы из `@.../welds/models` (через публичный API).

---

## 5) Web feature — таблица “Реестр швов” (без красоты)
В `libs/welds/feature-welds` создай standalone страницу:
- `Welds` (standalone)

Требования:
- На `ngOnInit` загрузи список через `WeldApi.list()`
- Храни данные минимально: можно через `signal<Weld[]>([])` + `signal<boolean>(false)` для loading
- UI: `p-table` (PrimeNG Table) показывает колонки:
  - Номер стыка (`weldNumber`)
  - D, мм (`diameter`)
  - S1, мм (`thickness1`)
  - S2, мм (`thickness2`)
  - Уровень качества (`qualityLevel`)
  - Дата сварки (`weldDate`)
  - Способ сварки (`weldingProcess`)
  - Тип сварного соединения (`joint`)
  - Методы НК (`testMethods`)
  - Заключение (`conclusion`)
  - Статус (`weldStatus`)
  - Примечание (`notes`)
- Никаких “красивостей” и сложной вёрстки — главное, чтобы данные пришли и отрисовались.


### Routing
Добавь маршрут в `apps/web`:
- путь: `/welds`
- компонент: `Welds` (из feature lib)

---

## 6) Проверка работоспособности (Acceptance Criteria)
Считать задачу выполненной, если:

1) `pnpm nx serve api` поднимает API без ошибок
2) `pnpm nx serve web` открывает страницу `/welds` и отображает таблицу
3) CRUD работает через curl/HTTP:
  - можно `POST` добавить запись
  - `GET` список показывает добавленную запись
4) Соблюдены границы: нет доменной логики в `apps/web`, `apps/api` только подключает модуль/конфиг

---

“ориентируйся на официальные доки Nx/Angular/Nest/PrimeNG/tailwindcss/и др.” 
“не придумывай API, если можно опереться на документацию”

---

В GET /api/welds?search= ищем по: weldNumber (основное)

И добавь индекс в Mongoose на weldNumber (хотя бы index: true) — иначе потом поиск/сортировка начнёт тормозить.
