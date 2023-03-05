export function idFor(host: any, f: Function) {
	return (host ? host[Symbol.toStringTag] + '.' : '') + f.name
}
