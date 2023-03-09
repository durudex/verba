import {Formula, isPromise} from 'verba-common'
import {compare} from 'verba-compare'
import {Cursor} from './cursor'
import {idFor} from './id-for'
import {Unit, UnitCache} from './unit'

// represents an asynchronous flow step.
// used to temporarily memoize non-pure or CPU-intensive work.
// functions wrapped with tasks are intended to be called from other units
export class Task<F extends Formula> extends Unit<F> {
	static empty: [] = []

	static for<F extends Formula>(
		host: ThisParameterType<F>,
		formula: F,
		args: Parameters<F>
	): Task<F> {
		const parent = Unit.current

		if (parent) {
			const last = parent.cursor < parent.subAt
				? parent.data[parent.cursor]
				: null

			if (
				last &&
				last instanceof Task &&
				last.host === host &&
				compare(args, last.args)
			) {
				return last
			}
		}

		return new Task<F>(idFor(host, formula) + '(...)', formula, host, args)
	}

	set(next: UnitCache<F>) {
		const prev = this.cache
		this.cache  = next

		if (isPromise(next)) {
			this.cursor = Cursor.fresh
		} else {
			this.cursor = Cursor.final

			if (this.sweep()) {
				this.dispose()
			}
		}

		if (next !== prev) {
			this.notify()
		}
	}

	release() {
		if (!isPromise(this.cache)) {
			this.dispose()
		}
	}
}
