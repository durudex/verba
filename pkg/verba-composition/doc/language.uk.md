# Мова композиції



## Класи (Class)

Перший рядок має містити назву згенерованого класу та базовий клас через пробіл:

```
ClassName BaseName
```

До назви згенерованого класу додається долар:

```ts
class ClassName$ extends BaseClass {}
```

## Властивості (Property)

Далі йде список властивостей довільної довжини.

```
ClassName BaseName
	Property1 Initializer
	Property2 Initializer
	Property3 Initializer
```

Із властивостей генеруються методи:

```ts
class ClassName$ extends BaseClass {
	Property1() {
		return Initializer
	}

	Property2() {
		return Initializer
	}

	Property3() {
		return Initializer
	}
}
```

## Ініціалізатори (Initializer)

Ініціалізатор - це декларативне описання значення властивості.  Ініціалізатором може бути примітив, масив, запис чи об'єкт.

## Примітиви (Primitives)

### Рядки (String)

Рядки розмежовуються апострофами (`'`), підтримуються наступні спеціальні послідовності:

- `\n`
- `\t`
- `\\`
- `\'`

Інтерпретуються так само, як у JavaScript.

### Числа (Number)

Підмножина числових літералів із JavaScript. Підтримуються цілі, нецілі та від'ємні числа у десятичному записі, також спеціальне значення `Infinity` та `-Infinity`.

### Булеві значення (Boolean)

Так само, як у JavaScript.

### Нульове значення (Null)

Так само, як у JavaScript.

## Змінні властивості (Mutable property)

Перед назвою властивості можна додати ключове слово `mut`. До згенерованого методу буде затосовано декоратор `cell`, а сам він отримає опціональний параметр `next` із автоматично виведеним типом.

```
ClassName BaseName
	mut count 0
	mut message 'Greetings!'
```

```ts
class ClassName$ extends BaseName {
	static {
		cell(this.prototype, 'count')
		cell(this.prototype, 'message')
	}

	count(next?: number) {
		if (def(next)) return next
		return 0
	}

	message(next?: string) {
		if (def(next)) return next
		return 'Greetings!'
	}
}
```

## Словники (Dictionary)

Щоби зробити властивість словником, перед його ім'ям треба додати конструкцію `key(typename)`, де `typename` - назва типу ключа.

`key` можна поєднати з `mut`, тоді до метода буде застосовано декоратор `dict`.

```
ClassName BaseName
	key(number) fib 0
	mut key(string) friend false
```

```ts
class ClassName$ extends BaseName {
	static {
		dict(this, 'friend')
	}

	fib(key: number) {
		return 0
	}

	friend(key: string, next?: boolean) {
		if (def(next)) return next
		return false
	}
}
```

## Масиви (Array)

Щоби повернути з методу масив, просто перелічіть його елементи.

```
ClassName BaseName
	kids
		'foo'
		'bar'
		'baz'
```

Можна явно вказати назву типу елементів у квадратних дужках:

```
ClassName BaseName
	kids [string]
```

Анотація типу є обов'зяковою, якщо описаний масив - порожній.

Валідні елементи масивів (та ще декількох конструкцій, про які - згодом) називаються виразами.

## Вирази (Expression)

Вираз - це ініціалізатор, посилання на існуючу властивість чи оголошення нової. Останній варіант дозволяє описувати властивості саме там, де вони використовуються. Це дає нам змогу описувати об'єктну композицію у наочному деревовидному стилі, а не пласким списком методів.

```
ClassName BaseName
	Existent null
	kids
		Existent
		Left 'left'
		Mid 'mid'
		Right 'right'
		Nested
			'foo'
			'bar'
```

```ts
class ClassName$ extends BaseName {
	Existent() {
		return null
	}

	kids() {
		return [
			this.Existent(),
			this.Left(),
			this.Mid(),
			this.Right(),
			this.Nested(),
		]
	}

	Left() {
		return 'left'
	}

	Mid() {
		return 'mid'
	}

	Right() {
		return 'right'
	}

	Nested() {
		return [
			'foo',
			'bar',
		]
	}
}
```

## Записи (Record)

Записи - це описання об'єктних літералів. Їхній синтаксис нагадує масиви, але вони оголошуються фігурними дужками `{}`, а перед кожним елементом через пробіл потрібно вказати його ключ-ідентифікатор.

```
ClassName BaseClass
	styles {}
		display 'flex'
		color mut colorHex '#000000'
```

Всередині `{}` можна вказати тип ключа та значення через кому з пробілом:

```
ClassName BaseClass
	tabs {FilterType, string}
		all 'All tasks'
		active 'Active tasks'
		completed 'Completed tasks'
```

```ts
class ClassName$ extends BaseClass {
	tabs(): Record<FilterType, string> {
		return {
			all: 'All tasks',
			active: 'Active tasks',
			completed: 'Completed tasks',
		}
	}
}
```

## Об'єкти (Object)

**TODO**

## Аліаси (Alias)

**TODO**
