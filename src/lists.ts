// Video

export const COLUMNS = {
	off: 1,
	'ada-solo': 4,
	digifuts: 5,
	'space-1': 6,
} as const;

const LAYER_A = 6;
export const LAYERS = {
	a: LAYER_A,
	b: LAYER_A + 1,
} as const;

// Light

export const CUES = {
	blackout: 2,
	inloop: 1,
	front: 3,
	ombouw: 4,
	'1-opening': 4,
	'1-game': 5,
	'3-basis': 4,
	'3-schemer': 12,
	'5-digifuts': 7,
	space: 8,
} as const;
