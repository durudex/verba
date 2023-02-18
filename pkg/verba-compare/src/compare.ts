const cache = new WeakMap<any, WeakMap<any, boolean>>()

export function compare<T>(a: T, b: T): boolean {
	if (Object.is(a, b)) return true

	if (
		a === null ||
		b === null ||
		typeof a !== 'object' ||
		typeof b !== 'object'
	) return false

	const ap = Reflect.getPrototypeOf(a)
	const bp = Reflect.getPrototypeOf(b)

	if (ap !== bp) return false

	if (a instanceof Date) {
		return a.valueOf() === b.valueOf()
	}
	if (a instanceof RegExp) {
		return a.source === b['source'] && a.flags === b['flags']
	}
	if (a instanceof Error) {
		return a.message === b['message'] && a.stack === b['stack']
	}

	let ac = cache.get(a)
	if (ac) {
		const bc = ac.get(b)
		if (typeof bc === 'boolean') return bc
	} else {
		cache.set(
			a,
			(ac = new WeakMap().set(b, true))
		)
	}

	let result: boolean

	try {
		if (ap && !Reflect.getPrototypeOf(ap)) {
			const aKeys = Object.getOwnPropertyNames(a)
			const bKeys = Object.getOwnPropertyNames(b)

			result = aKeys.length === bKeys.length

			if (result) {
				for (let i = 0; i < aKeys.length; i++) {
					const key = aKeys[i]

					result = compare(a[key], b[key])

					if (!result) {
						break
					}
				}
			}
		}

		else if (Array.isArray(a)) {
			result = a.length === b['length']

			if (result) {
				for (let i = 0; i < a.length; i++) {
					result = compare(a[i], b[i])

					if (!result) {
						break
					}
				}
			}
		}

		else if (a instanceof Set) {
			result =
				a.size === b['size'] &&
				compareIter(a.values(), b['values']())
		}

		else if (a instanceof Map) {
			result =
				a.size === b['size'] &&
				compareIter(a.keys(), b['keys']()) &&
				compareIter(a.values(), b['values']())
		}

		else if (ArrayBuffer.isView(a)) {
			result = a.byteLength === b['byteLength']

			if (result) {
				for (let i = 0; i < a.byteLength; i++) {
					result = a[i] === b[i]
					if (!result) {
						break
					}
				}
			}
		}

		else if (Symbol.toPrimitive in a) {
			result =
				(a as any)[Symbol.toPrimitive]('default') ===
				(b as any)[Symbol.toPrimitive]('default')
		}

		else result = false
	} finally {
		ac.set(b, result!)
	}

	return result
}

function compareIter<T>(a: Iterator<T>, b: Iterator<T>) {
	for (;;) {
		const an = a.next()
		const bn = b.next()

		if (an.done) {
			return !!bn.done
		}

		if (!compare(an.value, bn.value)) return false
	}
}
