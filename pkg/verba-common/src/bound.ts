import {Formula} from './formula'

export function bound(
	host: object,
	field: string,
	descriptor?: TypedPropertyDescriptor<Formula>
) {
	descriptor ??= Reflect.getOwnPropertyDescriptor(host, field)!

	const formula = descriptor.value!

	const next: PropertyDescriptor = {
		get() {
			const bound = formula.bind(this)

			Reflect.defineProperty(host, field, {value: bound})

			return bound
		},
	}

	Reflect.defineProperty(host, field, next)
	return next
}
