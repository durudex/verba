import {Formula, memo} from 'verba-common'
import {Atom} from './atom'
import {idFor} from './id-for'

export const cell = memo<Formula, CellAtom>(
	(f, store) => function (...args) {
		let stored = store.get(this)
		if (!stored) {
			stored = new CellAtom(idFor(this, f) + '()', f, this)
			stored.store = store
			store.set(this, stored)
		}

		return stored.channel(0, args)
	}
)

class CellAtom extends Atom<Formula> {
	store!: WeakMap<any, Atom<Formula>>

	dispose() {
		super.dispose()
		this.store.delete(this.host)
	}
}
