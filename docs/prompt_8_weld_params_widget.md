# Изменение шаблона `weld-params-widget` под редактирование параметров

В этом виджете параметры стыка должны быть представлены в виде формы, а не только прочитанного списка.  Предлагается изменить шаблон `weld-params-widget.component.html` и соответствующий класс компонента таким образом, чтобы поля автоматически заполнялись из MongoDB (через входной параметр `weld`) и могли быть отредактированы пользователем.  При верстке используются только утилитарные классы Tailwind и CSS‑переменные PrimeNG, чтобы виджет корректно работал во всех пресетах и темах, как предписано в репозитории【939084532887408†L96-L103】.

## Обновлённый шаблон `weld-params-widget.component.html`

```html
<!-- Виджет параметров стыка с формой -->
<p-card class="w-full">
  <ng-template pTemplate="header">
    <div class="flex items-center gap-2 px-4 pt-4">
      <i class="pi pi-cog text-primary text-xl"></i>
      <span class="text-lg font-semibold">Параметры стыка</span>
    </div>
  </ng-template>

  @if (weld) {
    <!-- Сетка: 1 колонка на мобильных устройствах, 2 на планшете и 4 (6‑частную) на десктопе.  
         Для десктопа используем 6 равных частей: маленькие колонки занимают 1 часть, 
         большие — 2 части. Это позволяет задать разную ширину, сохраняя соотношение. -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 p-4">
      <!-- Первая колонка (D, S1, S2) -->
      <div class="lg:col-span-1 flex flex-col gap-4">
        <!-- Диаметр -->
        <div p-floatLabel class="w-full">
          <p-inputNumber [(ngModel)]="weld.diameter" inputId="diameter" [min]="0" class="w-full" inputStyleClass="w-full" />
          <label for="diameter">Диаметр (D), мм</label>
        </div>
        <!-- Толщина S1 -->
        <div p-floatLabel class="w-full">
          <p-inputNumber [(ngModel)]="weld.thickness1" inputId="thickness1" [min]="0" [minFractionDigits]="1" [maxFractionDigits]="2" class="w-full" inputStyleClass="w-full" />
          <label for="thickness1">Толщина S1, мм</label>
        </div>
        <!-- Толщина S2 -->
        <div p-floatLabel class="w-full">
          <p-inputNumber [(ngModel)]="weld.thickness2" inputId="thickness2" [min]="0" [minFractionDigits]="1" [maxFractionDigits]="2" class="w-full" inputStyleClass="w-full" />
          <label for="thickness2">Толщина S2, мм</label>
        </div>
      </div>

      <!-- Вторая колонка (уровень качества, способ сварки, тип соединения) -->
      <div class="lg:col-span-2 flex flex-col gap-4">
        <!-- Уровень качества (SelectButton) -->
        <p-selectButton 
          [options]="qualityLevelOptions" 
          [(ngModel)]="weld.qualityLevel" 
          optionLabel="label" 
          optionValue="value" 
          [allowEmpty]="false" 
          styleClass="w-full" />
        <!-- Способ сварки -->
        <div p-floatLabel class="w-full">
          <input pInputText [(ngModel)]="weld.weldingProcess" id="weldingProcess" class="w-full" />
          <label for="weldingProcess">Способ сварки</label>
        </div>
        <!-- Тип сварного соединения -->
        <div p-floatLabel class="w-full">
          <input pInputText [(ngModel)]="weld.joint" id="joint" class="w-full" />
          <label for="joint">Тип соединения</label>
        </div>
      </div>

      <!-- Третья колонка — пустая: здесь позже можно разместить изображение -->
      <div class="lg:col-span-1"></div>

      <!-- Четвёртая колонка (дата и примечания) -->
      <div class="lg:col-span-2 flex flex-col gap-4">
        <!-- Дата сварки -->
        <div p-floatLabel class="w-full">
          <input pInputText type="date" [(ngModel)]="weld.weldDate" id="weldDate" class="w-full" />
          <label for="weldDate">Дата сварки</label>
        </div>
        <!-- Примечания -->
        <div p-floatLabel class="w-full">
          <textarea pInputTextarea [(ngModel)]="weld.notes" id="notes" rows="5" class="w-full"></textarea>
          <label for="notes">Примечания</label>
        </div>
      </div>
    </div>
  } @else {
    <div class="text-center text-surface-500 py-4">
      Данные не загружены
    </div>
  }
</p-card>
```

В разметке используется грид на основе Tailwind: на десктопах (`lg:`) контейнер делится на 6 частей; первое и третье содержимое занимают одну часть (`lg:col-span-1`), второе и четвёртое — две части (`lg:col-span-2`).  На планшетах (`md:`) сетка превращается в две колонки, поэтому третий блок встаёт под первый, а четвёртый — под второй.  На мобильных устройствах все блоки идут одной колонкой.  Такой подход удовлетворяет требование адаптивности и использует только Tailwind‑классы, без инлайновых стилей【939084532887408†L96-L103】.

## Обновления для `weld-params-widget.component.ts`

Чтобы шаблон работал, необходимо подключить модули PrimeNG и `FormsModule`, а также определить набор вариантов для уровня качества.  В файле `weld-params-widget.component.ts`:

1.  Добавьте необходимые импорты:

```ts
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectButtonModule } from 'primeng/selectbutton';
import { CardModule } from 'primeng/card';
// другие существующие импорты оставьте без изменений
```

2.  Расширьте массив `imports` в декораторе `@Component`, чтобы включить новые модули:

```ts
@Component({
  selector: 'app-weld-params-widget',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    FormsModule,
    InputTextModule,
    InputTextareaModule,
    InputNumberModule,
    SelectButtonModule,
  ],
  templateUrl: './weld-params-widget.component.html',
})
```

3.  В классе компонента добавьте набор опций для `p-selectButton`:

```ts
export class WeldParamsWidgetComponent {
  @Input() weldId: string = '';
  @Input() weld: Weld | null = null;

  // варианты уровня качества для кнопок
  readonly qualityLevelOptions = [
    { label: 'A — Высший', value: 'A' },
    { label: 'B — Средний', value: 'B' },
    { label: 'C — Базовый', value: 'C' },
  ];

  // другие методы (formatWeldingProcess, formatJoint и т.п.) оставьте как есть
}
```

Такой набор изменений позволит отображать и редактировать параметры стыка в удобной форме.  Все поля автоматически заполняются значениями из объекта `weld`, если они присутствуют (например, при загрузке данных из MongoDB), при этом цвета и стили наследуются из текущего пресета и темы.
