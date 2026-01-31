/**
 * Welds — страница "Реестр сварных соединений"
 *
 * Отображает таблицу (PrimeNG p-table) со списком сварных соединений.
 * Поддерживает inline-добавление новых стыков прямо в таблице.
 * Поддерживает Column Toggle для управления видимостью колонок.
 *
 * @see https://primeng.org/table — PrimeNG Table
 * @see https://primeng.org/table#column-toggle — Column Toggle
 * @see https://angular.dev/guide/signals — Angular Signals
 * @see https://angular.dev/guide/forms/reactive-forms — Reactive Forms
 */

import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

// PrimeNG v21 компоненты
// @see https://primeng.org/
import { TableModule, TableRowSelectEvent } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { MultiSelectModule } from 'primeng/multiselect';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { MessageService, ConfirmationService, SelectItem } from 'primeng/api';

// Data Access — API сервис
import { WeldsApiService } from '@piloman/welds/data-access';

// Типы из models
import type { Weld, CreateWeldDto } from '@piloman/welds/models';

/**
 * Определение колонки таблицы для Column Toggle
 * widthClass — Tailwind класс фиксированной ширины (например, 'w-[120px]')
 * @see https://primeng.org/table#column-toggle
 */
interface TableColumn {
  field: string;
  header: string;
  widthClass: string;
}

/**
 * Тип строки таблицы: либо реальный Weld, либо draft (черновик для добавления)
 */
type TableRow = Weld | { _isDraft: true };

/**
 * Интерфейс для объекта строительства (денормализованные данные)
 */
interface ConstructionObjectOption {
  objectName: string;
  contractor: string;
  customer: string;
}

/**
 * Колонки, скрытые по умолчанию
 */
const HIDDEN_BY_DEFAULT = ['weldDate', 'weldingProcess', 'joint', 'weldStatus', 'notes'];

/**
 * Standalone компонент — страница реестра сварных соединений
 *
 * Использует:
 * - Angular Signals для состояния (welds, loading, isAdding, isSaving)
 * - PrimeNG Table для отображения данных
 * - PrimeNG Form Controls для inline-формы добавления
 * - PrimeNG MultiSelect для Column Toggle
 * - WeldsApiService для загрузки/сохранения данных
 * - MessageService для Toast уведомлений
 */
@Component({
  selector: 'piloman-welds',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    DatePickerModule,
    MultiSelectModule,
    ToastModule,
    ConfirmDialogModule,
    TooltipModule,
    DialogModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './welds.html',
})
export class Welds implements OnInit {
  /**
   * Router для навигации на дашборд стыка
   * @see https://angular.dev/guide/routing
   */
  private readonly router = inject(Router);

  /**
   * WeldsApiService для загрузки/сохранения данных
   */
  private readonly weldsApi = inject(WeldsApiService);

  /**
   * FormBuilder для создания реактивных форм
   * @see https://angular.dev/guide/forms/reactive-forms
   */
  private readonly fb = inject(FormBuilder);

  /**
   * MessageService для Toast уведомлений
   * @see https://primeng.org/toast
   */
  private readonly messageService = inject(MessageService);

  /**
   * ConfirmationService для диалогов подтверждения
   * @see https://primeng.org/confirmdialog
   */
  private readonly confirmationService = inject(ConfirmationService);

  /**
   * Список уникальных объектов строительства (извлечённых из welds)
   */
  objects = signal<ConstructionObjectOption[]>([]);

  /**
   * Выбранный объект для фильтрации и привязки новых стыков
   */
  selectedObject = signal<ConstructionObjectOption | null>(null);

  /**
   * Видимость диалога создания объекта
   */
  isObjectDialogVisible = signal<boolean>(false);

  /**
   * Список сварных соединений (Angular Signal)
   */
  welds = signal<Weld[]>([]);

  /**
   * Флаг загрузки данных
   */
  loading = signal<boolean>(false);

  /**
   * Флаг режима добавления (показывает inline-форму)
   */
  isAdding = signal<boolean>(false);

  /**
   * Флаг сохранения (блокирует форму во время запроса)
   */
  isSaving = signal<boolean>(false);

  /**
   * ID удаляемого стыка (для отображения loading состояния на кнопке)
   */
  deletingId = signal<string | null>(null);

  /**
   * Выбранный стык (для single selection в таблице)
   * Используется для навигации на дашборд при клике
   */
  selectedWeld: Weld | null = null;

  /**
   * Данные для таблицы: если isAdding — добавляем draft строку в начало
   * Computed signal для реактивного обновления
   */
  tableData = computed<TableRow[]>(() => {
    const welds = this.welds();
    if (this.isAdding()) {
      return [{ _isDraft: true } as TableRow, ...welds];
    }
    return welds;
  });

  /**
   * Все доступные колонки таблицы
   * @see https://primeng.org/table#column-toggle
   */
  readonly cols: TableColumn[] = [
    { field: 'weldNumber', header: 'Номер стыка', widthClass: 'w-[140px] min-w-[140px] max-w-[140px]' },
    { field: 'diameter', header: 'D, мм', widthClass: 'w-[80px] min-w-[80px] max-w-[80px]' },
    { field: 'thickness1', header: 'S1, мм', widthClass: 'w-[75px] min-w-[75px] max-w-[75px]' },
    { field: 'thickness2', header: 'S2, мм', widthClass: 'w-[75px] min-w-[75px] max-w-[75px]' },
    { field: 'qualityLevel', header: 'Уровень качества', widthClass: 'w-[60px] min-w-[60px] max-w-[60px]' },
    { field: 'weldDate', header: 'Дата сварки', widthClass: 'w-[120px] min-w-[120px] max-w-[120px]' },
    { field: 'weldingProcess', header: 'Способ сварки', widthClass: 'w-[130px] min-w-[130px] max-w-[130px]' },
    { field: 'joint', header: 'Тип соединения', widthClass: 'w-[130px] min-w-[130px] max-w-[130px]' },
    { field: 'testMethods', header: 'Методы НК', widthClass: 'w-[150px] min-w-[150px] max-w-[150px]' },
    { field: 'conclusion', header: 'Заключение', widthClass: 'w-[110px] min-w-[110px] max-w-[110px]' },
    { field: 'weldStatus', header: 'Статус', widthClass: 'w-[100px] min-w-[100px] max-w-[100px]' },
    { field: 'notes', header: 'Примечание', widthClass: 'w-[150px] min-w-[150px] max-w-[150px]' },
  ];

  /**
   * Выбранные (видимые) колонки
   * По умолчанию скрыты: Дата сварки, Способ сварки, Тип соединения, Статус
   */
  selectedColumns: TableColumn[] = this.cols.filter(
    (col) => !HIDDEN_BY_DEFAULT.includes(col.field)
  );

  /**
   * Форма для добавления нового стыка
   * Обязательные поля: weldNumber, diameter, thickness1, qualityLevel
   */
  newRowForm: FormGroup = this.fb.group({
    weldNumber: ['', [Validators.required]],
    diameter: [null, [Validators.required, Validators.min(1)]],
    thickness1: [null, [Validators.required, Validators.min(0.1)]],
    thickness2: [null],
    qualityLevel: ['B', [Validators.required]],
    weldDate: [null],
    weldingProcess: ['SMAW_GMAW'],
    joint: ['BUTT'],
    testMethods: [[]],
    conclusion: [null],
    weldStatus: ['draft'],
    notes: [''],
  });

  /**
   * Форма для создания нового объекта строительства
   */
  objectForm: FormGroup = this.fb.group({
    objectName: ['', [Validators.required]],
    contractor: ['', [Validators.required]],
    customer: ['', [Validators.required]],
  });

  /**
   * Опции для выпадающего списка "Уровень качества"
   */
  readonly qualityLevelOptions: SelectItem[] = [
    { label: 'A — Высший', value: 'A' },
    { label: 'B — Средний', value: 'B' },
    { label: 'C — Базовый', value: 'C' },
  ];

  /**
   * Опции для выпадающего списка "Способ сварки"
   */
  readonly weldingProcessOptions: SelectItem[] = [
    { label: 'Ручная дуговая, полуавтоматическая', value: 'SMAW_GMAW' },
    { label: 'Автоматическая в защитных газах', value: 'GTAW' },
    { label: 'Автоматическая под флюсом', value: 'SAW' },
  ];

  /**
   * Опции для выпадающего списка "Тип соединения"
   */
  readonly jointOptions: SelectItem[] = [
    { label: 'Стыковое', value: 'BUTT' },
    { label: 'Угловое/Нахл.', value: 'FILLET_LAP' },
  ];

  /**
   * Опции для мультиселекта "Методы НК"
   */
  readonly testMethodsOptions: SelectItem[] = [
    { label: 'ВИК', value: 'VT' },
    { label: 'УЗК', value: 'UT' },
    { label: 'РК', value: 'RT' },
    { label: 'МК', value: 'MT' },
    { label: 'ПВК', value: 'PT' },
  ];

  /**
   * Опции для выпадающего списка "Заключение"
   */
  readonly conclusionOptions: SelectItem[] = [
    { label: 'Годен', value: 'OK' },
    { label: 'Ремонт', value: 'REPAIR' },
    { label: 'Вырезать', value: 'CUT' },
  ];

  /**
   * Опции для выпадающего списка "Статус"
   */
  readonly statusOptions: SelectItem[] = [
    { label: 'Черновик', value: 'draft' },
    { label: 'В работе', value: 'in_progress' },
    { label: 'Завершён', value: 'done' },
  ];

  /**
   * Загрузка данных при инициализации компонента
   */
  ngOnInit(): void {
    this.loadWelds();
  }

  /**
   * Загрузка списка сварных соединений с API
   * При первой загрузке также извлекает уникальные объекты
   */
  private loadWelds(): void {
    this.loading.set(true);
    const objectName = this.selectedObject()?.objectName;

    this.weldsApi.list(objectName ? { objectName } : undefined).subscribe({
      next: (data) => {
        this.welds.set(data);
        this.loading.set(false);

        // Извлекаем уникальные объекты из всех стыков (только при первой загрузке)
        if (this.objects().length === 0) {
          this.extractUniqueObjects(data);
        }
      },
      error: (err) => {
        console.error('Ошибка загрузки данных:', err);
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Ошибка',
          detail: 'Не удалось загрузить данные',
        });
      },
    });
  }

  /**
   * Извлечение уникальных объектов строительства из списка стыков
   */
  private extractUniqueObjects(welds: Weld[]): void {
    const objectsMap = new Map<string, ConstructionObjectOption>();

    for (const weld of welds) {
      if (weld.objectName) {
        objectsMap.set(weld.objectName, {
          objectName: weld.objectName,
          contractor: weld.contractor || '',
          customer: weld.customer || '',
        });
      }
    }

    this.objects.set(Array.from(objectsMap.values()));
  }

  /**
   * Обработчик смены выбранного объекта
   * Перезагружает список стыков для нового объекта
   */
  onObjectChange(object: ConstructionObjectOption | null): void {
    this.selectedObject.set(object);
    this.cancelAdding();
    this.loadWelds();
  }

  /**
   * Открытие диалога создания объекта строительства
   */
  showObjectDialog(): void {
    this.objectForm.reset({
      objectName: '',
      contractor: '',
      customer: '',
    });
    this.isObjectDialogVisible.set(true);
  }

  /**
   * Сохранение нового объекта строительства
   * Добавляет в локальный список и выбирает его
   */
  saveObject(): void {
    this.objectForm.markAllAsTouched();

    if (this.objectForm.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Внимание',
        detail: 'Заполните все обязательные поля',
      });
      return;
    }

    const newObject: ConstructionObjectOption = {
      objectName: this.objectForm.value.objectName,
      contractor: this.objectForm.value.contractor,
      customer: this.objectForm.value.customer,
    };

    // Добавляем в список и выбираем
    this.objects.update((objects) => [newObject, ...objects]);
    this.selectedObject.set(newObject);
    this.isObjectDialogVisible.set(false);

    this.messageService.add({
      severity: 'success',
      summary: 'Успешно',
      detail: `Объект "${newObject.objectName}" добавлен`,
    });

    // Перезагружаем стыки (будет пустой список для нового объекта)
    this.loadWelds();
  }

  /**
   * Проверка валидности поля формы объекта
   */
  isObjectFieldInvalid(fieldName: string): boolean {
    const control = this.objectForm.get(fieldName);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  /**
   * Начать добавление нового стыка
   * Показывает inline-форму в таблице
   */
  startAdding(): void {
    this.isAdding.set(true);
    this.resetForm();
  }

  /**
   * Отмена добавления
   * Скрывает форму и очищает данные
   */
  cancelAdding(): void {
    this.isAdding.set(false);
    this.resetForm();
  }

  /**
   * Сброс формы к начальным значениям
   */
  private resetForm(): void {
    this.newRowForm.reset({
      weldNumber: '',
      diameter: null,
      thickness1: null,
      thickness2: null,
      qualityLevel: 'B',
      weldDate: null,
      weldingProcess: 'SMAW_GMAW',
      joint: 'BUTT',
      testMethods: [],
      conclusion: null,
      weldStatus: 'draft',
      notes: '',
    });
  }

  /**
   * Проверка валидности поля для отображения ошибки
   */
  isFieldInvalid(fieldName: string): boolean {
    const control = this.newRowForm.get(fieldName);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  /**
   * Форматирование значения ячейки в зависимости от поля
   */
  formatCellValue(row: Weld, field: string): string {
    const value = row[field as keyof Weld];

    switch (field) {
      case 'weldDate':
        return this.formatDate(value as string | undefined);
      case 'weldingProcess':
        return this.formatWeldingProcess(value as string | undefined);
      case 'joint':
        return this.formatJoint(value as string | undefined);
      case 'testMethods':
        return this.formatTestMethods(value as string[] | undefined);
      case 'conclusion':
        return this.formatConclusion(value as string | undefined);
      case 'weldStatus':
        return this.formatStatus(value as string | undefined);
      case 'thickness2':
      case 'notes':
        return value != null && value !== '' ? String(value) : '-';
      default:
        return value != null ? String(value) : '-';
    }
  }

  /**
   * Сохранение нового стыка
   * Выполняет валидацию, отправляет запрос на API
   */
  saveWeld(): void {
    // Пометить все поля как touched для отображения ошибок
    this.newRowForm.markAllAsTouched();

    if (this.newRowForm.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Внимание',
        detail: 'Заполните обязательные поля: Номер стыка, D, S1',
      });
      return;
    }

    // Проверяем, что выбран объект строительства
    const selectedObj = this.selectedObject();
    if (!selectedObj) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Внимание',
        detail: 'Сначала выберите или создайте объект строительства',
      });
      return;
    }

    this.isSaving.set(true);

    // Формируем DTO для API
    const formValue = this.newRowForm.value;
    const dto: CreateWeldDto = {
      // Данные объекта строительства
      objectName: selectedObj.objectName,
      contractor: selectedObj.contractor,
      customer: selectedObj.customer,
      // Данные стыка
      weldNumber: formValue.weldNumber,
      diameter: formValue.diameter,
      thickness1: formValue.thickness1,
      qualityLevel: formValue.qualityLevel,
    };

    // Добавляем опциональные поля только если они заполнены
    if (formValue.thickness2 != null) {
      dto.thickness2 = formValue.thickness2;
    }
    if (formValue.weldDate) {
      // Преобразуем Date в ISO string
      dto.weldDate = formValue.weldDate instanceof Date
        ? formValue.weldDate.toISOString().split('T')[0]
        : formValue.weldDate;
    }
    if (formValue.weldingProcess) {
      dto.weldingProcess = formValue.weldingProcess;
    }
    if (formValue.joint) {
      dto.joint = formValue.joint;
    }
    if (formValue.testMethods && formValue.testMethods.length > 0) {
      dto.testMethods = formValue.testMethods;
    }
    if (formValue.conclusion) {
      dto.conclusion = formValue.conclusion;
    }
    if (formValue.weldStatus) {
      dto.weldStatus = formValue.weldStatus;
    }
    if (formValue.notes && formValue.notes.trim()) {
      dto.notes = formValue.notes.trim();
    }

    this.weldsApi.create(dto).subscribe({
      next: (createdWeld) => {
        // Добавляем созданный стык в начало списка
        this.welds.update((welds) => [createdWeld, ...welds]);
        this.isSaving.set(false);
        this.isAdding.set(false);
        this.resetForm();

        this.messageService.add({
          severity: 'success',
          summary: 'Успешно',
          detail: `Стык "${createdWeld.weldNumber}" добавлен`,
        });
      },
      error: (err) => {
        console.error('Ошибка сохранения:', err);
        this.isSaving.set(false);

        // Показываем ошибку, форма остаётся открытой
        const errorMessage = err.error?.message || 'Не удалось сохранить данные';
        this.messageService.add({
          severity: 'error',
          summary: 'Ошибка',
          detail: Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage,
        });
      },
    });
  }

  /**
   * Форматирование даты для отображения
   */
  formatDate(value: string | undefined): string {
    if (!value) return '-';
    try {
      const date = new Date(value);
      return date.toLocaleDateString('ru-RU');
    } catch {
      return value;
    }
  }

  /**
   * Форматирование способа сварки для отображения
   */
  formatWeldingProcess(value: string | undefined): string {
    const map: Record<string, string> = {
      SMAW_GMAW: 'РД/МП',
      GTAW: 'А',
      SAW: 'АФ',
    };
    return value ? map[value] || value : '-';
  }

  /**
   * Форматирование типа соединения
   */
  formatJoint(value: string | undefined): string {
    const map: Record<string, string> = {
      BUTT: 'Стыковое',
      FILLET_LAP: 'Угловое/Нахл.',
    };
    return value ? map[value] || value : '-';
  }

  /**
   * Форматирование методов НК (массив → строка)
   */
  formatTestMethods(value: string[] | undefined): string {
    if (!value || value.length === 0) return '-';

    const map: Record<string, string> = {
      VT: 'ВИК',
      UT: 'УЗК',
      RT: 'РК',
      MT: 'МК',
      PT: 'ПВК',
    };
    return value.map((m) => map[m] || m).join(', ');
  }

  /**
   * Форматирование заключения
   */
  formatConclusion(value: string | undefined): string {
    const map: Record<string, string> = {
      OK: 'Годен',
      REPAIR: 'Ремонт',
      CUT: 'Вырезать',
    };
    return value ? map[value] || value : '-';
  }

  /**
   * Форматирование статуса
   */
  formatStatus(value: string | undefined): string {
    const map: Record<string, string> = {
      draft: 'Черновик',
      in_progress: 'В работе',
      done: 'Завершён',
    };
    return value ? map[value] || value : '-';
  }

  /**
   * Обработчик выбора строки таблицы
   *
   * Переходит на страницу дашборда выбранного стыка.
   * Игнорирует выбор draft-строки (форма добавления).
   *
   * @param event - событие выбора строки PrimeNG Table
   * @see https://primeng.org/table#single-row-selection
   */
  onRowSelect(event: TableRowSelectEvent): void {
    const row = event.data;

    // Игнорируем draft-строку (форма добавления)
    if (row._isDraft) {
      return;
    }

    const id = row.id ?? row._id;
    if (id) {
      this.router.navigate(['/welds', id, 'dashboard']);
    }
  }

  /**
   * Удаление стыка с подтверждением
   *
   * Показывает ConfirmDialog, при подтверждении отправляет DELETE запрос.
   * При успехе удаляет строку из локального списка и показывает toast.
   *
   * @param row - строка таблицы (Weld)
   * @see https://primeng.org/confirmdialog
   */
  onDeleteWeld(row: Weld): void {
    const id = row.id ?? (row as { _id?: string })._id;

    if (!id) {
      this.messageService.add({
        severity: 'error',
        summary: 'Ошибка',
        detail: 'Не удалось определить ID стыка',
      });
      return;
    }

    this.confirmationService.confirm({
      message: 'Удалить стык? Действие необратимо.',
      header: 'Подтверждение удаления',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Удалить',
      rejectLabel: 'Отмена',
      accept: () => {
        this.deletingId.set(id);

        this.weldsApi.remove(id).subscribe({
          next: () => {
            // Удаляем стык из локального списка
            this.welds.update((welds) => welds.filter((w) => w.id !== id));
            this.deletingId.set(null);

            this.messageService.add({
              severity: 'success',
              summary: 'Успешно',
              detail: `Стык "${row.weldNumber}" удалён`,
            });
          },
          error: (err) => {
            console.error('Ошибка удаления:', err);
            this.deletingId.set(null);

            const errorMessage = err.error?.message || 'Не удалось удалить стык';
            this.messageService.add({
              severity: 'error',
              summary: 'Ошибка',
              detail: Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage,
            });
          },
        });
      },
    });
  }
}
