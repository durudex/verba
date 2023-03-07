import {Formula, isDisposable} from 'verba-common'
import {compare} from 'verba-compare'
import {Cursor} from './cursor'
import {Unit, UnitCache} from './unit'
import {owning, owningCheck} from './owning'
import {Task} from './task'
import {action} from './action'

// atom is a long-living reactive computation
export class Atom<F extends Formula> extends Unit<F> {
	set(next: UnitCache<F>) {
		if (!compare(this.cache, next)) {
			if (owningCheck(this.cache, this)) {
				this.cache.dispose()
			}

			if (isDisposable(next) && !owning.has(next)) {
				owning.set(next, this)

				try {
					next[Symbol.toStringTag] = this.id
				} catch {}
			}

			this.notify()
		}

		this.cache = next
		this.cursor = Cursor.fresh

		// release upstream tasks
		for (let i = this.pubAt; i < this.pubLimit; i += 2) {
			(this.data[i] as Unit).release()
		}
	}

	channel(skip: number, args: Parameters<F>) {
		if (args.length > skip && args[skip] !== undefined) {
			return this.push(args)
		}

		if (Unit.current instanceof Task) {
			return this.pullOnce()
		}

		return this.pull()
	}

	pullOnce() {
		return this.pull()
	}

	push(args: Parameters<F>) {
		this.set(this.formula.apply(this.host, args))
		return this.cache
	}

	dispose() {
		super.dispose()

		if (owningCheck(this.cache, this)) {
			this.cache.dispose()
		}
	}
}

action(Atom.prototype, 'pullOnce')
action(Atom.prototype, 'push')
