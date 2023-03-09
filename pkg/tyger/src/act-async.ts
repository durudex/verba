import {isPromise, noop} from 'verba-common'
import {Cursor} from './cursor'
import {Task} from './task'

const forever = new Promise(noop)

export async function actAsync<T>(f: () => T) {
	const task = Task.for(f, f, Task.empty)

	for (;;) {
		task.refresh()

		if (task.cache instanceof Error) {
			throw task.cache
		}

		if (!isPromise(task.cache)) {
			return task.cache
		}

		await task.cache

		if (task.cursor === Cursor.final) {
			await forever
		}
	}
}
