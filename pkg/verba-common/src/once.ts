import {wrapper} from './wrapper'

export const [once, createOnce] = wrapper<() => any>(
	formula => {
		const cache = new WeakMap<any, any>()

		return {
			next() {
				if (cache.has(this)) {
					return cache.get(this)
				}

				const next = formula.apply(this)
				cache.set(this, next)
				return next
			},

			inspect() {
				return cache.get(this)
			},
		}
	}
)
