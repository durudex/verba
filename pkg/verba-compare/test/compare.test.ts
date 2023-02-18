import {assert, test} from '@krulod/sorcerer'
import {compare} from '../src/compare'

function is<T>(a: T, b: T) {
	return assert.is(compare(a, b), true)
}

function isnt<T>(a: T, b: T) {
	return assert.is(compare(a, b), false)
}

test('compare', {
	'null and unefined': () => {
		is(null, null)
		is(undefined, undefined)
		isnt(undefined, null)
		isnt({}, null)
	},

	'nan': () => {
		is(NaN, NaN)
	},

	'json': () => {
		is({}, {})
		isnt({x: true}, {x: false})
		isnt({x: undefined}, {})
		is({a: 1, b: 2}, {b: 2, a: 1})
		is({x: {y: 1}}, {x: {y: 1}})
	},

	'array': () => {
		is([], [])
		is([1, [2]], [1, [2]])
		isnt([0], [1])
		isnt([1, 2, ], [1, 2, undefined])
	},

	'identity': () => {
		class X {}

		isnt(new X(), new X())

		isnt(() => {}, () => {})
	},

	'circular reference': () => {
		const a = {x: {}}
		a['cycle'] = a

		const b = {x: {}}
		b['cycle'] = b

		is(a, b)
	},

	'date': () => {
		is(new Date(111), new Date(111))
		isnt(new Date(0), new Date(1))
	},

	'regexp': () => {
		is(/\x22/mig, /\x22/mig)
		isnt(/\x22/mig, /\x21/mig)
		isnt(/\x22/mig, /\x22/mg)
	},

	'error': () => {
		isnt(new Error(), new Error())

		function err(val: string) {
			return new Error(val)
		}

		{
			const [a, b] = ['', ''].map(err)
			is(a, b)
		}

		{
			const [a, b] = ['foo', 'bar'].map(err)
			isnt(a, b)
		}
	},


	'map': () => {
		is(new Map(), new Map())
		is(
			new Map([['x', [0]]]),
			new Map([['x', [0]]])
		)
		isnt(
			new Map([['x', [true]]]),
			new Map([['x', [false]]]),
		)

	},

	'set': () => {
		is(new Set(), new Set())
		isnt(
			new Set([[true]]),
			new Set([[false]])
		)
	},

	'uint8array': () => {
		is(new Uint8Array(), new Uint8Array())
		is(new Uint8Array([0]), new Uint8Array([0]))
		isnt(new Uint8Array([0]), new Uint8Array([1]))
	},

	'custom': () => {
		class User {
			constructor(readonly name: string) {}

			[Symbol.toPrimitive]() {
				return this.name
			}
		}

		is(new User('Jin'), new User('Jin'))
		isnt(new User('Jin'), new User('John'))
	},
})
