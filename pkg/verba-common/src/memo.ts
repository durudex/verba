import {Formula} from './formula'

export interface Memo<BaseF extends Formula> {
	<F extends BaseF>(
		host: object,
		field: string,
		descr?: TypedPropertyDescriptor<F>
	): void

	<F extends BaseF>(formula: F, name?: string): F
}

type Wrap<F> = (prev: F, store: WeakMap<any, any>) => F

/** Define a decorator with inspectable state. */
export const memo = <BaseF extends Formula, Stored>(wrap: Wrap<BaseF>) =>
	((...args: any[]) => {
		const store = new WeakMap<any, Stored>()

		// closure wrapper

		if (args.length !== 3) {
			let next = wrap(args[0], store)
			next = next.bind(next) as BaseF

			const name = args[1]
			if (name) {
				Reflect.defineProperty(next, 'name', {value: name})
			}

			return next
		}

		// method decorator

		const [
			host,
			field,
			descr = Reflect.getOwnPropertyDescriptor(host, field)!,
		] = args

		const next = wrap(descr.value, store)

		Reflect.defineProperty(next, 'name', {value: descr.value.name})

		Reflect.defineProperty(host, '$$' + field, {
			get() {
				return store.get(this)
			},
		})

		descr.value = next
	}) as Memo<BaseF>


