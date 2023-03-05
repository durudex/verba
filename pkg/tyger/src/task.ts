import {Formula, isPromise} from 'verba-common'
import {Cursor} from './cursor'
import {Unit, UnitCache} from './unit'

export class Task<F extends Formula> extends Unit<F> {
	set(next: UnitCache<F>) {
		const prev = this.cache
		this.cache  = next

		if (isPromise(next)) {
			this.cursor = Cursor.fresh
		} else {
			this.cursor = Cursor.final

			if (this.subEmpty) {
				this.dispose()
			}
		}

		if (next !== prev) {
			this.emit()
		}
	}

	release(): void {
		if (!isPromise(this.cache)) {
			this.dispose()
		}
	}
}
