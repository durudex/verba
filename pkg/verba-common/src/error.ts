import {isPromise} from './is'

const caught = new WeakSet<any>()

export function errorLog(err: unknown) {
	if (isPromise(err) || !errorCatch(err)) {
		return false
	}

	console.error(err)
}

export function errorCatch(err: unknown) {
	if (isPromise(err)) {
		throw err
	}

	if (caught.has(err)) {
		return false
	}

	caught.add(err)

	return true
}
