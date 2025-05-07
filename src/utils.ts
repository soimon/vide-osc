export const byNumberOrKey = <T>(input: any, MAP: Record<string, T>) =>
	typeof input === 'string' && input in MAP
		? MAP[input]
		: // : typeof input === 'number'
		  // ? input
		  (console.error('Invalid input:', input), undefined);
