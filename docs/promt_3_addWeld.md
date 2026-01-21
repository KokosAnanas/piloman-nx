# Задача: Inline-добавление стыка в «Реестр сварных соединений» (PrimeNG + TailwindCSS + Nx)

В корне есть `apps/` и доменная библиотека `libs/welds/`. :contentReference[oaicite:0]{index=0}

## Цель (для НК/сварки)
На странице **«Реестр сварных соединений»** сделать быстрый сценарий: нажал **«Добавить стык»** → появилась **новая строка-форма прямо в таблице** → заполнил некоторые поля → нажал **«Сохранить»** в конце строки → запись сохранилась в БД → строка превратилась в обычную строку таблицы (без инпутов).

---

## Acceptance criteria (что должно работать)
1. Рядом с заголовком **«Реестр сварных соединений»** есть кнопка **«Добавить стык»**.
2. По клику:
  - в таблице появляется **новая строка** (первой строкой),
  - **каждая ячейка** этой строки — **инпут/контрол** (по типу данных),
  - в **последней ячейке** строки есть кнопка **«Сохранить»**.
3. По клику **«Сохранить»**:
  - выполняется валидация (минимум: обязательные поля - Номер стыка, D, S1),
  - выполняется запрос на API (POST) и сохранение в MongoDB,
  - при успехе: новая запись отображается как обычная строка таблицы (readonly-режим),
  - при ошибке: строка остаётся в режиме формы, показывается ошибка (toast/message).
4. Использовать **PrimeNG** и **TailwindCSS**. Никаких самописных таблиц.
5. Соблюдать правила Nx: бизнес-логика/запросы/стор — в `libs/welds/*`, а `apps/web` — только композиция.

---


### Inline-строка-форма в таблице
Рекомендуемый подход (простой и управляемый):
- Держи состояние добавления через `isAdding = signal(false)` (или Signals Store).
- Держи `newRowForm: FormGroup` (Reactive Forms).
- По клику **Добавить стык**:
  - визуально вставь в `p-table` “виртуальную” строку (draft) и рендери для неё инпуты вместо текста.

Контролы:
- строки → `p-inputText`
- числа → `p-inputNumber`
- дата → `p-calendar`
- справочники → `p-dropdown`
  Выбор контролов делай по фактическим типам в текущей таблице/модели (что уже есть на странице).

UI/UX:
- Инпуты по ширине ячейки: `class="w-full"`

### Сохранение
- Кнопка **Сохранить** в конце строки:
  - `p-button` (label: "Сохранить", icon: "pi pi-check")
  - disabled пока форма невалидна / идёт сохранение.
- Обработчик:
  1) если invalid → показать подсказки/ошибку
  2) если valid → вызвать store/service 
  3) при success:
    - добавить возвращённую запись в массив данных таблицы (уже без draft) и очистить `newRowForm`
  4) при error:
    - показать `p-toast`/`MessageService` и оставить строку в режиме формы

---

### Модель / схема
- с полями, которые реально есть в текущей таблице реестра.
- Mongoose schema + timestamps.

### Интеграция с фронтом
- Проанализируй, если необходимо, сделай В `libs/welds/store` (Signals Store):
  - состояние списка
  - `load()`
  - `create()` + optimistic UI (опционально) или просто добавление по ответу.
- Или предложи свой вариант
- 
---

### Уточнения
- Таблица: используй существующие колонки и порядок. Draft-строка должна иметь инпуты строго по этим колонкам.
- Одновременно только 1 draft-строка: пока isAdding=true кнопка "Добавить стык" disabled.
- Добавь кнопку "Отмена" в конце draft-строки рядом с "Сохранить" (убирает draft и чистит форму).
- Проанализируй, лучше будет если - Ответ: созданная сущность с _id; добавь её в store/таблицу без перезагрузки.
- Ошибки показывай через PrimeNG Toast (MessageService).
- UX менять нельзя: существующие строки readonly, редактируется только добавляемая строка.

---

## Официальные доки (ориентиры)
- PrimeNG Table: https://primeng.org/table
- PrimeNG Button: https://primeng.org/button
- PrimeNG InputText: https://primeng.org/inputtext
- PrimeNG InputNumber: https://primeng.org/inputnumber
- PrimeNG Dropdown: https://primeng.org/dropdown
- PrimeNG Calendar: https://primeng.org/calendar
- Tailwind Flex: https://tailwindcss.com/docs/flex
- Tailwind Gap: https://tailwindcss.com/docs/gap
- Angular Reactive Forms: https://angular.dev/guide/forms/reactive-forms
- NestJS Controllers: https://docs.nestjs.com/controllers
- NestJS MongoDB (Mongoose): https://docs.nestjs.com/techniques/mongodb
- Mongoose Schemas: https://mongoosejs.com/docs/guide.html
