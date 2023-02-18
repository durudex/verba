export function update<T>(
	source: (next?: T) => T,
	fn: (prev: T) => T
) {
	return source(fn(source()))
}
