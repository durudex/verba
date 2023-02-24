# Мова композиції

Мова композиції Verba - елегантний спосіб описувати реактивні моделі у декларативному стилі.

## Класи (Class)

Перший рядок має містити назву згенерованого класу та базовий клас через пробіл:

```
Model Base
```

До назви згенерованого класу додається долар:

```ts
class Model$ extends Base {}
```

## Властивість (Property)

Далі йде список із нуля або більшої кількості властивостей. Властивість записується як опціональний список модифікаторів, назва властивості та описання значення властивості через пробіл.

```
Model Base
	Property1 Value
	Property2 Value
	Property3 Value
```

Із кожної властивості генерується однойменний метод:

```ts
class Model$ extends Base {
	Property1() {
		return Value
	}

	Property2() {
		return Value
	}

	Property3() {
		return Value
	}
}
```

Значення властивості може бути виразом або об'єктом. Про них - трохи пізніше.

Перед назвою можна додати нуль або більше модифікаторів у наступному порядку:

- `mut`
- `key(T)`
- `returns(T)`

### Змінна властивість (Mutable property)

Перед назвою властивості можна додати ключове слово `mut`, щоби зробити її змінною. Згенерований метод мемоїзується й отримує параметр `next` із автоматично виведеним типом.

```
Model Base
	mut count 0
```

```ts
class Model$ extends Base {
	@cell count(next = 0) {
		return next
	}
}
```

### Словник (Dictionary)

Щоби зробити властивість словником, перед його ім'ям треба додати конструкцію `key(T)`, де `T` - назва типу ключа.

До мемоїзованого словника застосовується декоратор `dict`.

```
Model Base
	key(number) fib 0
	mut key(string) friend false
```

```ts
class ClassName$ extends BaseName {
	fib(key: number) {
		return 0
	}

	@dict friend(key: string, next = false) {
		return next
	}
}
```

<!--

### Явний повертаємий тип (Explicit return type)

`return(T)`, де `T` - назва повертаємого типу.

```
Model Base
```

-->

## Вираз (Expression)

Вираз - це значення властивості чи складова частина інших конструкцій. Виразом може бути оголошення властивості, посилання на існуючу властивість, примітив, масив або запис.

## Примітив (Primitive)

Примітив - це рядок, число, булеве значення чи `null`.

### Рядок (String)

Рядки розмежовуються апострофами (`'`), підтримуються наступні спеціальні послідовності:

- `\n`
- `\t`
- `\\`
- `\'`

Інтерпретуються так само, як у JavaScript.

### Число (Number)

Підмножина числових літералів із JavaScript. Підтримуються цілі, нецілі та від'ємні числа у десятичному записі, також спеціальне значення `Infinity` та `-Infinity`.

### Булеве значення (Boolean)

Так само, як у JavaScript.

### Нульове значення (Null)

Так само, як у JavaScript.

## Масив (Array)

Масив - список виразів.

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

## Вкладена властивість (Nested property)

Оголошення властивості в якості виразу дає нам змогу описувати об'єктну композицію у наочному деревовидному стилі, а не пласким списком методів.

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

## Запис (Record)

Запис - це описання об'єктного літералу. Його синтаксис нагадує масиви, але запис оголошуються фігурними дужками `{}`, а перед кожним елементом через пробіл потрібно вказати його ключ-ідентифікатор.

```
Model Base
	styles {}
		display 'flex'
		color mut colorHex '#000000'
```

```ts
class Model$ extends Base {
	@cell colorHex(next = '#000000') {
		return next
	}

	styles() {
		return {
			display: 'flex',
			color: this.colorHex(),
		}
	}
}
```

Всередині `{}` можна вказати тип ключа та значення через кому з пробілом:

```
Model Base
	tabs {FilterType, string}
		all 'All tasks'
		active 'Active tasks'
		completed 'Completed tasks'
```

```ts
class Model$ extends Base {
	tabs(): Record<FilterType, string> {
		return {
			all: 'All tasks',
			active: 'Active tasks',
			completed: 'Completed tasks',
		}
	}
}
```

## Об'єкт (Object)

Щоби описати об'єкт Об'єкт може бути створений лише всередині властивості. Така властивість автоматично мемоїзується й називається фабрикою. Не лякайтеся прикладу нижче, він демонструє всі три види зв'язувань, про які - згодом.

```
App View
	kids
		Username KyInputString
			value > username
		Button KyButton
			onClick = buttonClick null
			kids
				ButtonIcon KyIconStar
				'Click me, '
				username
				'!'
```

```ts
class App$ extends View {
	kids() {
		return [
			this.Username(),
			this.Button(),
		]
	}

	@cell Username() {
		return new KyInputString
	}

	username() {
		return this.Username().value()
	}

	@cell Button() {
		const x = new KyButton
		x.onClick = next => this.buttonClick(next)
		x.kids = () => [
			this.ButtonIcon(),
			'Click me, ',
			this.username(),
			'!',
		]
		return x
	}

	@cell buttonClick(next?: Parameters<KyButton['onClick']>[0] = null) {
		return next
	}

	@cell ButtonIcon() {
		return new KyIconStar
	}
}
```

## Властивість об'єкту (Object property)

### Підміна властивості (Property override)

Самий поширений тип зв'язувань - це підміна властивості. Записується просто як назва властивості та довільний вираз через пробіл.

Підміна дозволяє налаштувати об'єкт чи навіть перевизначити деталі його реалізації, замінивши його властивість на власну. Ця техніка ідентична перевизначенню методу базового класу в нащадку, тільки на рівні екземплярів.

```
Model Base
	Obj Some
		first 0
		second ownSecond 1
```

```ts
class Model$ extends Base {
	@cell Obj() {
		const x = new Obj
		x.first = () => 0
		x.second = () => this.ownSecond()
	}

	ownSecond() {
		return 1
	}
}
```

### Аліас (Alias)

Аліас записується як назва властивості об'єкту, символ `>` та назва власного методу, що буде повертати цільову властивість.

```
FancyInput View
	kids
		Basic KyInputString
			value > value
```

```ts
class FancyInput$ extends View {
	kids() {
		return [
			this.Basic(),
		]
	}

	@cell Basic() {
		return new KyInputString
	}

	value() {
		return this.Basic().value()
	}
}
```

### Двобічне зв'язування (Two-way binding)

Те саме, що й підміна, але для змінних властивостей. Записується як назва цільової властивості об'єкту, символ `=` та назва власної змінної властивості, що буде джерелом даних для цільової властивості. Можна на місці оголосити власну властивість, дописавши її початкове значення через пробіл.

```
App View
	mut count1 -10
	kids
		Counter1 Counter
			value = count1
		Counter2 Counter
			value = count2 10
```

```ts
class App$ extends View {
	@cell count1(next = -10) {
		return next
	}

	kids() {
		return [
			this.Counter1(),
			this.Counter2(),
		]
	}

	@cell Counter1() {
		const x = new Counter
		x.value = next => this.count1(next)
		return x
	}

	@cell Counter2() {
		const x = new Counter
		x.value = next => this.count2(next)
		return x
	}

	@cell count2(next = 10) {
		return next
	}
}
```
