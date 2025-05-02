// Video

export const COLUMNS = {
	off: 1,
	split: 3,
	'ada-solo': 4,
	upload: 5,
	download: 9,
	'download-aurelia': 10,
	digifuts: 6,
	'space-1': 7,
} as const;

const LAYER_A = 6;
export const LAYERS = {
	monitorA: 2,
	monitorB: 1,
	a: LAYER_A,
	b: LAYER_A + 1,
	debug: 8,
} as const;

// Light

export const CUES = {
	blackout: 8,
	aanvang: 2,
	slaapkamer: 3,
	'slaapkamer-2': 5,
	'slaapkamer-schemer': 6,
	'slaapkamer-upload': 7,
	flauwval: 9,
	awakening: 10,
	'awakening-ouders': 11,
	game: 12,
	'game-fade': 14,
	'blackout-fade': 13,
	alarm: 15,
	'alarm-blacklight': 16,
	'blacklight-zonder-alarm': 17,
	studiolamp: 18,
	aurelia: 19,
	inloop: 1,
	full: 3.5,
	vr: 4,
	'front-mooi': 20,
	applaus: 21,
	uitloop: 22,
	'ombouw-vol': 100,
	'ombouw-voor': 101,
	'ombouw-psych': 102,
	'ombouw-woonkamer': 103,
} as const;
