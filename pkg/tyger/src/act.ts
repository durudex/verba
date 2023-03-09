import {Task} from './task'

export function act<T>(f: () => Promise<T>) {
	return Task.for(f, f, Task.empty).pull()
}
