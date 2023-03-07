import {memo} from 'verba-common'
import {Task} from './task'

export const action = memo(f => function (this: any, ...args: any) {
	return Task.for(this, f, args).pull()
})
