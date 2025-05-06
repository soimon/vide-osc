export const byNumberOrKey = (input: any, MAP: Record<string, number>) =>
	typeof input === 'string' && input in MAP
		? MAP[input]
		: typeof input === 'number'
		? input
		: (console.error('Invalid input:', input), undefined);
