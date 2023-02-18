export function def(x: unknown): x is {} | null {
	return x !== undefined
}
