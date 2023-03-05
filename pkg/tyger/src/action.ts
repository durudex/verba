import {wrapper} from 'verba-common'
import {taskFor} from './task-for'

export const [action, createAction] = wrapper(formula => ({
	next(...args) {
		return taskFor(this, formula, args).pull()
	},
}))
