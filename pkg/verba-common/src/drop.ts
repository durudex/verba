type Predicate<T> = (item: T, index: number) => boolean

export function drop<T>(
	source: (next?: T[]) => T[],
	filter: Predicate<T>
) {
	return source(source().filter(filter))
}

export function dropItems<T>(
	source: (next?: T[]) => T[],
	items: T[]
) {
	return drop(source, x => items.includes(x))
}
