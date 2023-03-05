import {once} from './once'

export class Base {
	static make<T extends object>(
		this: new () => T,
		config: Partial<T> = {}
	) {
		return Object.assign(new this, config)
	}

	@once static inheritance(): typeof Base[] {
		const base = Reflect.getPrototypeOf(this)

		return 'inheritance' in base!
			? [this, ...(base as typeof Base).inheritance()]
			: [this]
	}

	['constructor']!: typeof Base

	toString() {
		return Symbol.toStringTag in this
			? this[Symbol.toStringTag]
			: `<${this.constructor.name}>`
	}

	toJSON() {
		return this.toString()
	}

	dispose() {}
}
