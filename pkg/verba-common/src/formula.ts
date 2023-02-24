export type Formula<
	Host = any,
	Args extends any[] = any[],
	Result = any,
> = (this: Host, ...args: Args) => Result
