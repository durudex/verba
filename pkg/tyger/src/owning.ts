import {Disposable, isDisposable} from 'verba-common'

export const owning = new WeakMap<Disposable, object>()

export function owningCheck(value: unknown, owner: object): value is Disposable {
	return isDisposable(value) && owning.get(value) === owner
}
