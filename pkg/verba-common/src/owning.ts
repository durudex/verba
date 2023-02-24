import {Disposable} from './disposable'

export const owning = new WeakMap<Disposable, object>()
