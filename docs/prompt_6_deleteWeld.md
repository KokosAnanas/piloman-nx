Задача: удалить стык из реестра (UI + API) в Nx-monorepo (Angular + PrimeNG/Sakai + NestJS + MongoDB)

Контекст
- Таблица PrimeNG (p-table), первый столбец — “Действия” (фикс. ширина ~80px).
- В обычной строке сейчас в “Действия” стоит “-”, в Draft-строке — кнопки сохранить/отмена.
- Нужно добавить кнопку **удаления** в обычных строках и при клике:
  1) удалить строку из таблицы,
  2) удалить запись в MongoDB через API.

Файлы (ориентир)
Frontend:
- libs/welds/feature-welds/src/lib/welds.component.html
- libs/welds/feature-welds/src/lib/welds.component.ts
- libs/welds/data-access/src/lib/welds-api.service.ts
  Backend (если DELETE ещё нет):
- apps/api/src/app/welds/welds.controller.ts
- apps/api/src/app/welds/welds.service.ts

Требования (обязательные)
1) В первом столбце “Действия” **в каждой обычной строке** (не Draft) показать кнопку **“Удалить стык”**.
2) Кнопка должна быть **PrimeNG компонентом**: `p-button` (а не обычный `<button>`).
3) **Sakai-style + пресеты работают**:
  - Никаких захардкоженных цветов в Tailwind (`text-red-*`, `bg-red-*` и т.п.) для кнопки.
  - Внешний вид кнопки должен формироваться через PrimeNG theming (severity/variant), чтобы при смене темы/пресета (Aura/Lara/Nora) кнопка корректно меняла оформление.
4) В шаблонах **не добавлять кастомный CSS/SCSS**. Tailwind допускается **только** для layout/размера/выравнивания (ширина колонки, центрирование, отступы), без цветовых классов, которые “ломают” темы.
5) Колонка “Действия” остаётся фиксированной (например `w-[80px] min-w-[80px] max-w-[80px]`), кнопка не должна расширять колонку и дёргать таблицу.
6) Подтверждение удаления — в Sakai-стиле:
  - использовать `ConfirmDialog` + `ConfirmationService` (не `confirm()`), текст: “Удалить стык? Действие необратимо.”
7) При подтверждении:
  - отправить `DELETE /api/welds/:id`,
  - на успехе удалить строку из локального состояния (signals/store),
  - показать `p-toast` (success).
8) На ошибке:
  - строку не удалять,
  - показать `p-toast` (error).
9) Во время удаления:
  - кнопка в этой строке disabled,
  - показать loading через `p-button [loading]="..."` (без кастомных спиннеров).

Реализация (что именно сделать)
A) Шаблон (welds.component.html)
- В ветке обычной строки (там, где сейчас “-”) заменить на PrimeNG кнопку:
  - `p-button` с иконкой корзины (`icon="pi pi-trash"`)
  - вариант Sakai-по-умолчанию: **только иконка**, без текста, а “Удалить стык” — через tooltip:
    - `pTooltip="Удалить стык" tooltipPosition="top"`
  - Внешний вид через PrimeNG props (пример направления):
    - `severity="danger"`
    - `text` / `outlined` (выбери, что ближе к Sakai)
    - `rounded`
    - `size="small"`
  - Layout/фикс. размер колонки — Tailwind, но **без цветов**:
    - контейнер ячейки: `flex items-center justify-center w-[80px] min-w-[80px] max-w-[80px]`
- Для Draft-строки ничего не менять: там остаются кнопки сохранить/отмена.

B) Логика (welds.component.ts)
- Добавить сигнал состояния удаления:
  - `deletingId = signal<string | null>(null);`
- Добавить метод:
  - `onDeleteWeld(row: Weld | any)`
  - `const id = row.id ?? row._id;` (если нет — toast error и выйти)
  - Вызвать `confirmationService.confirm({...})`
  - В `accept`:
    - `deletingId.set(id)`
    - `this.weldsApi.deleteWeld(id)` → on success:
      - удалить элемент из локального списка (signals/store)
      - toast success
    - on error: toast error
    - finalize: `deletingId.set(null)`
- В шаблоне для кнопки:
  - `[disabled]="deletingId() === id || isSaving() || isAdding()"` (пример)
  - `[loading]="deletingId() === id"`

C) Data-access (welds-api.service.ts)
- Добавить метод:
  - `deleteWeld(id: string): Observable<void>`
  - `return this.http.delete<void>(\`\${baseUrl}/welds/\${id}\`);`

D) Backend (NestJS) — если эндпоинта нет
- Controller: `@Delete(':id')`
- Service: `findByIdAndDelete` / `deleteOne`
- Если не найдено — `NotFoundException`

Acceptance criteria
- В каждой обычной строке в “Действия” есть PrimeNG `p-button` с `pi-trash`.
- При смене темы/пресета (Sakai) кнопка корректно меняет стиль (не “прибита” Tailwind-цветами).
- ConfirmDialog появляется в стиле PrimeNG/Sakai.
- OK → строка исчезает, запись удалена из БД, success toast.
- Ошибка API → строка остаётся, error toast.
- Таблица не дёргается: ширина “Действия” фиксирована.
