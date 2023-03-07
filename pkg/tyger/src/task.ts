import {Formula, isPromise} from 'verba-common'
import {compare} from 'verba-compare'
import {Cursor} from './cursor'
import {idFor} from './id-for'
import {Unit, UnitCache} from './unit'

// task is an asynchronous flow step
export class Task<F extends Formula> extends Unit<F> {
	static for<F extends Formula>(
		host: ThisParameterType<F>,
		formula: F,
		args: Parameters<F>
	) {
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

		return new Task(idFor(host, formula), formula, host, args)
	}

	set(next: UnitCache<F>) {
		const prev = this.cache
		this.cache  = next

		if (isPromise(next)) {
			this.cursor = Cursor.fresh
		} else {
			this.cursor = Cursor.final

			if (this.sweepable()) {
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
