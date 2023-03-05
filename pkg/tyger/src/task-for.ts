import {Formula} from 'verba-common'
import {compare} from 'verba-compare'
import {idFor} from './id-for'
import {Task} from './task'
import {Unit} from './unit'

export function taskFor<F extends Formula>(
	host: ThisParameterType<F>,
	formula: F,
	args: Parameters<F>
) {
	const parent = Unit.current

	if (parent) {
		const last = parent.cursor < parent.subAt
			? parent.data[parent.cursor]
			: null

		if (
			last &&
			last instanceof Task &&
			last.host === host &&
			compare(args, last.args)
		) {
			return last
		}
	}

	return new Task(idFor(host, formula), formula, host, args)
}
