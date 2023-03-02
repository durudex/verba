import {compare} from 'verba-compare'

export function is<T>(a: T, b: T) {
	if (Object.is(a, b)) {
		return
	}

	throw new Assertion('Values should be equal', a, b)
}

export function isnt<T>(a: T, b: T) {
	if (!Object.is(a, b)) {
		return
	}

	throw new Assertion('Values should not be equal', a, b)
}

export function like<T>(a: T, b: T) {
	if (compare(a, b)) {
		return
	}

	throw new Assertion('Values should be structurally equal', a, b)
}

export function notLike<T>(a: T, b: T) {
	if (!compare(a, b)) {
		return
	}

	throw new Assertion('Values should not be structurally equal', a, b)
}

export function throws(
	fn: () => void,
	ctor?: Function,
) {
	let withType = false

	try {
		fn()
	} catch (error) {
		if (!ctor || error instanceof ctor) {
			return
		}

		withType = true
	}

	if (withType) {
		throw new Assertion(
			'Expected from function to throw an error of type',
			ctor,
		)
	} else {
		throw new Assertion('Expected from function to throw')
	}
}

export class Assertion extends Error {
	name = 'Assertion'

	constructor(
		message: string,
		public a?: unknown,
		public b?: unknown,
	) {
		super(message)
	}
}
