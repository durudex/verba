import {Formula} from './formula'

type Wrap<F> = (formula: F) => {
	next: F
	inspect?: (this: any) => any
}

export function wrapper<BaseF extends Formula>(wrap: Wrap<BaseF>) {
	function method(
		host: object,
		field: string,
		descr?: TypedPropertyDescriptor<BaseF>
	) {
		descr ??= Reflect.getOwnPropertyDescriptor(host, field)!

		const {next, inspect} = wrap(descr.value!)

		Reflect.defineProperty(host, '$$' + field, {get: inspect})

		descr.value = next
	}

	function closure<F extends BaseF>(formula: F) {
		const {next, inspect} = wrap(formula)
		const bound = next.bind(next)

		Reflect.defineProperty(bound, '$$', {get: inspect?.bind(bound)})

		return bound as F
	}

	return [method, closure] as const
}
