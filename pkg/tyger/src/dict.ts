import {Formula, memo, stringify} from 'verba-common'
import {Atom} from './atom'
import {idFor} from './id-for'

type Atoms = Map<string, DictAtom>

export const dict = memo<(this: any, key: any, ...args: any) => any, Atoms>
	((f, store) => function (...args) {
		let atoms = store.get(this)
		if (!atoms) {
			atoms = new Map<string, DictAtom>
			store.set(this, atoms)
		}

		const [key] = args
		const id = idFor(this, f) + '(' + stringify(key) + ')'

		let atom = atoms.get(id)
		if (!atom) {
			atom = new DictAtom(id, f, this, [key])
			atom.store = atoms
			atoms.set(id, atom)
		}

		return atom.channel(1, args)
	})

class DictAtom extends Atom<Formula> {
	store!: Atoms

	dispose() {
		super.dispose()
		this.store.delete(this.id)
	}
}
