export class Base {
	static make<T extends object>(
		this: new () => T,
		config: Partial<T> = {}
	) {
		return Object.assign(new this, config)
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
