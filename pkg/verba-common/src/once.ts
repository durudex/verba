import {memo} from './memo'

export const once = memo<() => any, any>((f, store) => function (this: any) {
	if (store.has(this)) {
		return store.get(this)
	}

	const next = f.apply(this)
	store.set(this, next)
	return next
})
