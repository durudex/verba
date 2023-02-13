# Styleguide

Це керівництво має бути посібником для всіх бажаючих зробити свій внесок у Verba, а розділ про модулі є корисним для всіх користувачів фреймворку.

## Formatting

Ми не використовуємо форматтери та лінтери (ESLint, Prettier, Rome, тощо), але не нав'язуємо це рішення.

### Line feeds

Має використовуватись `LF` переведення рядка (Unix-style).

### Indentation

Має використовуватись один символ табуляції.

### Line length

Довжина рядка не має перевищувати 80 символів.

### Semicolons

Крапки з комою мають використовуватися тільки в циклах `for`.

Погано:

```ts
unrelatedStatement()

;(function iife() {
	// ...
})()
```

Краще:

```ts
unrelatedStatement()

void function iife() {
	// ...
}()
```

### Declarations order

Модулі мають мати наступний порядок верхньорівневих оголошень:

1. імпорти
2. внутрішні змінні
3. експортовані змінні
4. експортовані класи та функції
5. внутрішні класи та функції

### Curly braces

Фігурні дужки не мають пропускатись у місцях, де вони не обов'язкові.

### Trailing commas

Хвостові коми мають використовуватись у багаторядкових імпортах/експортах, літералах об'єктів і масивів.

### Bracket spacing

Пробіли між парними дужками з однорядковим змістом не мають зустрічатись у коді в стилі Verba.

## Modules

Стиль Verba передбачає два підходи до организації коду в модулях. Перший, "бібліотечний", підходить для публікуємих пакетів. Це власне бібліотеки та інший інфраструктурний код. Другий, "структурований", має використовуватись при написанні Web-додатків, колекцій UI-компонентів та інших програм, які масштабуються радше горизонтально.

Деталі цих підходів описані в наступних розділах, а нижче приведені загальні правила написання модулів.

### File names

Імена файлів мають бути настільки односкладовими та лаконічними, наскільки можливо. *Мета імен - ідентифікація, а не передача семантики.*

Семантичну роль зазвичай відіграють і теги на кшталт `.hook`, `.factory`, `.controller`, `.view`.

Якщо ім'я файлу не вмістити в одному слові, використовуйте для розділення складових мінус (`-`).

Погано:

- `usesyncexternalstore.ts`
- `useSyncExternalStore.ts`
- `use_sync_external_store.ts`
- `use-sync-external-store.hook.ts`

Краще:

- `use-sync-external-store.ts`
- `use-observable.ts`
- `observe.ts`

### Exported declarations naming

Імена всіх типів, функцій, класів, тощо, мають містити в собі шлях до їхнього модуля.

Це, крім усього іншого, значить, що в межах пакету всі експортовані імена мають бути *унікальними*.

Погано:

```ts
// client.ts

export function createClient() {}
```

```ts
// operators.ts

export function map() {}

export function drop() {}

export function aggregate() {}
```

Краще:

```ts
// client.ts

export class Client {}
```

```ts
// du/explore/panel/panel.ts

export class DuExplorePanel {}
```

### Re-exports

Ре-експорти мають використовуватись тільки на верхньому рівні пакетів, а в усіх інших ситуаціях є нерекомендованими.

### Default exports

Експорти за замовчуванням не мають зустрічатись у коді в стилі Verba.

## Modules: libraries

Бібліотеки - це npm-пакети, які містять код, націлений на перевикористання. Навіть якщо перевикористання не є вашим пріоритетом, бібліотеки мають сенс для розділення відповідальності та інкапсуляції складної логіки.

Бібліотека має включати каталог `src`, що містить список `.ts`-файлів із реалізацією бібліотеки.

Тести складаються у каталозі `test`, який містить список *сюїт*. Сюїта - це файл із тегом `.test`, всередині якого за допомогою фреймворку тестування оголошується однойменна група тестів. У сюїтах бажано проводити інтеграційні тести, тому їхня структура не обов'зяково має відповідати структурі вихідних кодів.

## Modules: structured

Структуровані модулі - це npm-пакети, коди яких мають деревовидну форму.

Кожен структурований модуль - це просто каталог, який може містити документацію та довільну кількість вкладених модулів та реалізацію. Документація представляється `readme.md` файлом, який може містити приклади використання модуля та відносні посилання на вкладені модулі. Реалізація - це нуль або більше однойменних файлів із різними розширеннями. Стиль не нав'язує конкретні типи файлів, але на практиці зазвичай використовуються наступні:

- `.ts`
- `.style.ts`
- `.test.ts`

Модулі без реалізації називають неймспейсами.

Погано:

```
app/
├── domain/
│   └── auth/
│       └── auth.ts
└── view/
    └── auth/
        ├── page/
        │   └── page.ts
        ├── modal/
        │   └── modal.ts
        └── auth.ts
```

Краще:

```
app/
└── auth/
    ├── page/
    │   └── page.ts
    ├── modal/
    │   └── modal.ts
    ├── form/
    │   └── form.ts
    └── auth.ts
```