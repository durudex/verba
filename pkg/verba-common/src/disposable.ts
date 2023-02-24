export interface Disposable {
	dispose(): void
}

export function disposableCheck(value: unknown): value is Disposable {
	return (
		value !== null &&
		typeof value === 'object' &&
		typeof value['dispose'] === 'function'
	)
}
