import {Disposable} from './disposable'

export function isPromise(value: unknown): value is Promise<any> {
	return value instanceof Promise
}

export function isException(value: unknown): value is (Promise<any> | Error) {
	return isPromise(value) || value instanceof Error
}

export function isDisposable(value: unknown): value is Disposable {
	return (
		!!value &&
		typeof value === 'object' &&
		typeof value['dispose'] === 'function'
	)
}
