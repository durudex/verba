type Tests = Record<string, () => void>

export function test(title: string, tests: Tests) {
	console.log('TEST', {title, tests})
}

export namespace test {
	export function skip(title: string, tests: Tests) {
		console.log('SKIP', {title, tests})
	}
}
