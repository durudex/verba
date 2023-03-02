// keys for values that cannot be stringified are stored in a weakmap
let uid = 0
const ids = new WeakMap<object, number>()

export function stringify(val: unknown) {
	return JSON.stringify(val, (_, val) => {
		if (
			!val ||
			(typeof val !== 'object' && typeof val !== 'function') ||
			Array.isArray(val)
		) {
			return val
		}

		const proto = Reflect.getPrototypeOf(val)

		if (!proto || !Reflect.getPrototypeOf(proto)) {
			return val
		}

		if ('toJSON' in val) {
			return val
		}

		if (val instanceof RegExp) {
			return val + ''
		}

		return ids.get(val) ?? (ids.set(val, ++uid), uid)
	})
}
