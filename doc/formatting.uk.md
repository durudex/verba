# Керівництво по стилю написання коду

Ми не використовуємо форматтери та лінтери (ESLint, Prettier, Rome, тощо), але при розробці Verba ви можете налаштувати їх у себе локально згідно з правилами нижче.

## Переведення рядка

Має використовуватись `LF` переведення рядка (Unix-style).

## Відступи

Має використовуватись один символ табуляції.

## Довжина рядка

Довжина рядка не має перевищувати 80 символів.

## Крапки з комою

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

## Порядок оголошень

Модулі мають мати наступний порядок верхньорівневих оголошень:

1. імпорти
2. внутрішні змінні
3. експортовані змінні
4. експортовані класи та функції
5. внутрішні класи та функції

## Фігурні дужки

Фігурні дужки не мають пропускатись у місцях, де вони не обов'язкові.

## Хвостові коми

Хвостові коми мають використовуватись у багаторядкових імпортах/експортах, літералах об'єктів і масивів.

## Пробіли між дужками

Пробіли між парними дужками з однорядковим змістом не мають зустрічатись у коді в стилі Verba.
