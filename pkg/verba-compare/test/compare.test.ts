import {assert, test} from 'verba-viter'

test('compare', {
	'null and undefined': () => {
		assert.like(null, null)
		assert.like(undefined, undefined)
		assert.notLike(undefined, null)
		assert.notLike({}, null)
	},

	'nan': () => {
		assert.like(NaN, NaN)
	},

	'json': () => {
		assert.like({}, {})
		assert.notLike({x: true}, {x: false})
		assert.notLike({x: undefined}, {})
		assert.like({a: 1, b: 2}, {b: 2, a: 1})
		assert.like({x: {y: 1}}, {x: {y: 1}})
	},

	'array': () => {
		assert.like([], [])
		assert.like([1, [2]], [1, [2]])
		assert.notLike([0], [1])
		assert.notLike([1, 2, ], [1, 2, undefined])
	},

	'identity': () => {
		class X {}

		assert.notLike(new X(), new X())

		assert.notLike(() => {}, () => {})
	},

	'circular reference': () => {
		const a = {x: {}}
		a['cycle'] = a

		const b = {x: {}}
		b['cycle'] = b

		assert.like(a, b)
	},

	'date': () => {
		assert.like(new Date(111), new Date(111))
		assert.notLike(new Date(0), new Date(1))
	},

	'regexp': () => {
		assert.like(/\x22/mig, /\x22/mig)
		assert.notLike(/\x22/mig, /\x21/mig)
		assert.notLike(/\x22/mig, /\x22/mg)
	},

	'error': () => {
		assert.notLike(new Error(), new Error())

		function err(val: string) {
			return new Error(val)
		}

		{
			const [a, b] = ['', ''].map(err)
			assert.like(a, b)
		}

		{
			const [a, b] = ['foo', 'bar'].map(err)
			assert.notLike(a, b)
		}
	},


	'map': () => {
		assert.like(new Map(), new Map())
		assert.like(
			new Map([['x', [0]]]),
			new Map([['x', [0]]])
		)
		assert.notLike(
			new Map([['x', [true]]]),
			new Map([['x', [false]]]),
		)

	},

	'set': () => {
		assert.like(new Set(), new Set())
		assert.notLike(
			new Set([[true]]),
			new Set([[false]])
		)
	},

	'uint8array': () => {
		assert.like(new Uint8Array(), new Uint8Array())
		assert.like(new Uint8Array([0]), new Uint8Array([0]))
		assert.notLike(new Uint8Array([0]), new Uint8Array([1]))
	},

	'custom': () => {
		class User {
			constructor(readonly name: string) {}

			[Symbol.toPrimitive]() {
				return this.name
			}
		}

		assert.like(new User('Jin'), new User('Jin'))
		assert.notLike(new User('Jin'), new User('John'))
	},
})
