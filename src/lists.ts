// Video

export const COLUMNS = {
	off: 1,
	split: 3,
	'ada-solo': 4,
	'game1-intro': 5,
	game1: 6,
	'upload-intro': 7,
	upload: 8,
	'upload-large': 9,
	'upload-crash': 10,
	digifuts: 11,
	game2: 12,
	download: 13,
	game3: 14,
	trapped: 15,
	hunted: 16,
	aurelia: 17,
	'download-aurelia': 18,
	'space-1': 7,
} as const;

const LAYER_ADA = 6;
export const LAYERS = {
	monitorA: 2,
	monitorB: 1,
	background: LAYER_ADA - 1,
	ada: LAYER_ADA,
	asimov: LAYER_ADA + 1,
	close: LAYER_ADA + 2,
	debug: 9,
} as const;

export const SLIDES = {
	center: {
		ada: 0,
		asimov: 0,
	},
	wide: {
		ada: 0.17,
		asimov: -0.33,
	},
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
