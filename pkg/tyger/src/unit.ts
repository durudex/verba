import {Disposable, Formula, isException, isPromise, noop} from 'verba-common'
import {Cursor} from './cursor'

export type UnitCache<F extends Formula> =
	ReturnType<F> | Error | Promise<ReturnType<F> | Error>

const promises = new WeakSet<Promise<any>>()

// an unit is a lightweight object representing a caсрув pausable function
// with smart cache invalidation.
// Unit class implements efficient linking algorithms
// and handles exceptional states.
export class Unit<F extends Formula = Formula> {
	// data array holds all the variable data of an unit:
	// ┌────────┬───────────────────────────┬───────────────────────────┐
	// │0       │pubAt = 3                  │subAt = 11                 │
	// ├────────┼───────────────────────────┼───────────────────────────┤
	// │A0 A1 A2│P0 PS0 P1 PS1 P2 PS2 P3 PS3│S0 SS0 S1 SS1 S2 SS2 S3 SS3│
	// └────────┴───────────────────────────┴───────────────────────────┘
	//
	// args may store the key of an atom in a dictionary or task parameters.
	// next, there are publishers and subscribers lists
	// delimited by pubAt and subAt indexes.
	// these lists contain references to peer units alternating
	// with self indexes in the corresponding peer's data arrays.
	// we call every peer-index pair a slot.
	// unlike subscribers, publishers list is ordered and may contain holes.
	data: unknown[]
	pubAt: number
	subAt: number

	// cursor represents the state of a unit.
	// non-negative cursor means that this unit is currently refreshing
	// and points to the latest publisher index.
	// negative values encode the status of this unit's cache.
	cursor: number = Cursor.stale

	cache!: UnitCache<F>

	constructor(
		public id: string,
		public formula: F,
		public host?: ThisParameterType<F>,
		args?: any[],
	) {
		this.data = args?.slice() ?? []
		this.pubAt = this.subAt = this.data.length
	}

	get tracking() {
		return this.cursor >= 0
	}

	get subEmpty() {
		return this.subAt === this.data.length
	}

	get final() {
		return this.cursor === Cursor.final
	}

	get pubLimit() {
		return this.tracking ? this.cursor : this.subAt
	}

	get last() {
		return this.data.length - 2
	}

	get args() {
		return this.data.slice(0, this.pubAt)
	}

	get pubs() {
		return this.slice(this.pubAt, this.pubLimit)
	}

	get subs() {
		return this.slice(this.subAt, this.data.length)
	}

	private slice(min: number, max: number) {
		const result: Unit[] = []

		for (let i = min; i < max; i += 2) {
			const peer = this.data[i] as Unit | undefined
			if (peer) result.push(peer)
		}

		return result
	}

	private pop2() {
		this.data.pop()
		this.data.pop()
	}

	private move(from: number, to: number) {
		const peer = this.data[from] as Unit
		const selfAt = this.data[from + 1] as number

		this.data[to] = peer
		this.data[to + 1] = selfAt

		peer.data[selfAt + 1] = to
	}


	// declarations below are the graph traversal APIs.
	// they are implemented in an iterative style because
	// recursive algorithms are somewhat slower.
	//
	//           ┌───────────┐
	//         ┌─┤Root.emit()├──┐
	//         │ └───────────┘  │
	//         │                │
	//       ┌─▼─┬─────┐      ┌─▼─┬─────┐
	//   ┌───┤ A │stale├─┐    │ B │stale├──┐
	//   │   └───┴─────┘ │    └───┴─────┘  │
	//   │               │                 │
	// ┌─▼─┬─────┐     ┌─▼─┬─────┐       ┌─▼─┬─────┐
	// │ C │doubt│     │ D │doubt│       │ E │doubt│
	// └─┬─┴─────┘     └───┴─────┘       └─┬─┴─────┘
	//   │                                 │
	// ┌─▼─┬─────┐                       ┌─▼─┬─────┐
	// │ F │doubt│                       │ G │doubt│
	// └───┴─────┘                       └───┴─────┘

	emit() {
		for (let i = this.subAt; i < this.data.length; i += 2) {
			(this.data[i] as Unit).stale()
		}
	}

	// a global queue populated with units we need to mark as doubt
	private static queue: Unit[] = []

	// mark this unit as stale and its downstream as doubt
	stale() {
		if (this.enqueue(Cursor.stale)) {
			return
		}

		let unit: Unit | undefined

		while (unit = Unit.queue.pop()) {
			unit.enqueue(Cursor.doubt)
		}
	}

	// set this unit's cursor to c
	// and push its subscribers to the invalidation queue.
	// do nothing if the subtree is already invalidated.
	private enqueue(c: Cursor) {
		if (this.cursor >= c) return true

		this.cursor = c

		for (let i = this.subAt; i < this.data.length; i += 2) {
			Unit.queue.push(this.data[i] as Unit)
		}
	}

	// reaping is a procedure of cancelling unneeded work
	// and releasing resources for GC.
	// an unit is added to the reaping list whenever it loses the last sub
	// rendering libraries and integrations with Tyger
	// should invoke Unit.reap after commiting updates

	static reaping = new Set<Unit>()

	reapable() {
		return this.subEmpty
	}

	static reap() {
		while (Unit.reaping.size) {
			for (const unit of Unit.reaping) {
				if (unit.reapable()) {
					unit.dispose()
				}
			}
		}
	}

	// an unit's publisher count may reduce after refreshing.
	// in such case, a span of irrelevant publisher slots
	// appears in its data array between cursor and subAt.
	// cut() eliminates these pubs by copying the latest subs to
	// their former positions and dropping the old subscriber slots
	//
	// before:
	//          ┌─────────┐          ┌──────────┐         ┌──────────┐
	//          │pubAt = 3│          │cursor = 9│         │subAt = 15│
	// ┌────────┼─────────┴──────────┼──────────┴─────────┼──────────┴──────────────────────────────┐
	// │A0 A1 A2│P0 PS0 P1 PS1 P2 PS2│P3 PS3 P4 PS4 P5 PS5│S0 SS0 S1 SS1 S2 SS2 S3 SS3 S4 SS4 S5 SS5│
	// └────────┴────────────────────┴────────────────────┴─────────────────────────────────────────┘
	//
	// copy subs:
	//          ┌─────────┐          ┌─────────┐                               ┌────┐
	//          │pubAt = 3│          │subAt = 9│                               │tail│
	// ┌────────┼─────────┴──────────┼─────────┴───────────────────────────────┼────┴───────────────┐
	// │A0 A1 A2│P0 PS0 P1 PS1 P2 PS2│S3 SS3 S4 SS4 S5 SS5 S0 SS0 S1 SS1 S2 SS2│S3 SS3 S4 SS4 S5 SS5│
	// └────────┴────────────────────┴─────────────────────────────────────────┴────────────────────┘
	//
	// cut the tail:
	//          ┌─────────┐          ┌─────────┐
	//          │pubAt = 3│          │subAt = 9│
	// ┌────────┼─────────┴──────────┼─────────┴───────────────────────────────┐
	// │A0 A1 A2│P0 PS0 P1 PS1 P2 PS2│S3 SS3 S4 SS4 S5 SS5 S0 SS0 S1 SS1 S2 SS2│
	// └────────┴────────────────────┴─────────────────────────────────────────┘
	cut() {
		let tail = 0

		for (let i = this.cursor; i < this.subAt; i += 2) {
			const pub = this.data[i] as Unit | undefined

			if (pub !== undefined) {
				const pos = pub.data[i + 1] as number
				const end = pub.data.length - 2

				if (pos !== end) {
					pub.move(end, pos)
				}
				pub.pop2()

				if (pub.reapable()) {
					Unit.reaping.add(pub)
				}
			}

			if (this.subAt < this.data.length) {
				this.move(this.last, i)
				this.pop2()
			} else {
				tail++
			}

			while (tail--) {
				this.pop2()
			}

			this.subAt = this.cursor
		}
	}

	dispose() {
		// atoms usually dispose when they become unused,
		// but tasks do right after completion,
		// so we need to drop them out of their initiators' data slots
		for (let i = this.last; i >= this.subAt; i -= 2) {
			const sub = this.data[i] as Unit
			const pos = this.data[i + 1] as number

			sub.data[pos] = undefined
			sub.data[pos + 1] = undefined

			this.pop2()
		}

		this.cursor = this.pubAt
		this.cut()

		this.cursor = Cursor.final // 🕯️
	}

	//  linking context
	static current: Unit | null = null

	pull() {
		if (this.tracking) {
			this.cache = new Error('Circular subscription')
		} else {
			const sub = Unit.current

			// link to the current subscriber
			if (sub) {
				const c = sub.cursor

				if (c < sub.subAt) {
					const last = sub.data[c] as Unit | undefined

					if (sub === last) {
						sub.cursor += 2
						return
					}

					if (last) {
						sub.subDepart()
						sub.move(c, this.subAt - 2)
					}
				} else {
					// if subscriber's publisher count has grown,
					// reserve space for self
					// by sending subscriber's first subscriber slot
					// to the end of its data list
					sub.subDepart()
				}

				sub.data[c] = this
				sub.data[c + 1] = this.data.push(sub, c) - 2
				sub.cursor += 2
			}

			this.refresh()
		}

		if (isException(this.cache)) {
			throw this.cache
		}

		return this.cache as Awaited<ReturnType<F>>
	}

	private subDepart() {
		if (this.subAt < this.data.length) {
			this.move(this.subAt, this.data.length)
		}
		this.subAt += 2
	}

	refresh() {
		type Cache = UnitCache<F>

		// already fresh (or dead)
		if (this.cursor <= Cursor.fresh) return

		// if some upstream units have invalidated,
		// refresh direct publishers.
		// the graph may either rebuild such that invalidated units
		// fall out of this unit's upstream, so no update is needed,
		// or that change directly affects this unit.
		// in the latter case, become stale and continue refreshing...
		check: if (this.cursor === Cursor.doubt) {
			for (let i = this.pubAt; i < this.subAt; i += 2) {
				(this.data[i] as Unit | undefined)?.refresh()

				if (this.cursor !== Cursor.doubt) break check
			}

			this.cursor = Cursor.fresh
			return
		}

		// set up tracking context and recalculate the formula.
		const prev = Unit.current
		Unit.current = this
		this.cursor = this.pubAt

		let next: Cache

		// batchStart()

		try {
			// attempt to avoid an extra allocation in the most frequent cases:
			// - pull from a cell
			// - pull from a dictionary
			// - execute an action with up to 2 parameters
			if (this.pubAt === 0) {
				next = this.formula.call(this.host)
			} else if (this.pubAt === 1) {
				next = this.formula.call(this.host, this.data[0])
			} else {
				next = this.formula.apply(this.host, this.args)
			}

			if (isPromise(next)) {
				// after the promise is resolved/rejected,
				// resume the subtree by writing promise result to this unit's cache,
				// if it wasn't thrown out at the moment
				const resume = (result: Cache) => {
					if (this.cache === next) this.set(result)
				}

				next = promiseHandle(next, next.then(resume, resume))
			}
		} catch (caught) {
			if (isException(caught)) {
				next = caught
			} else {
				next = new Error(String(caught), {cause: caught})
			}

			// subscribe to the promise only if it was not handled
			// by some upstream unit
			if (isPromise(next) && !promises.has(next)) {
				next = promiseHandle(next, next.finally(() => {
					if (this.cache === next) this.stale()
				}))
			}
		}

		// cleanup pubs unless execution was suspended
		if (!isPromise(next)) {
			this.cut()
		}

		// reset the tracking context
		Unit.current = prev

		// refresh publishers
		for (let i = this.pubAt; i < this.cursor; i += 2) {
			(this.data[i] as Unit).refresh()
		}

		this.cursor = Cursor.fresh

		this.set(next)
	}

	// implementation is specific for atoms and tasks
	set(next: UnitCache<F>) {}

	// called by atoms to dispose upstream tasks if they are completed
	release() {}

}

function promiseHandle(prev: Promise<any>, next: Promise<any>) {
	promises.add(next)

	return Object.assign(next, {
		dispose: (prev as any as Partial<Disposable>).dispose ?? noop
	})
}
