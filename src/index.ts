import {Easing} from '@tweenjs/tween.js';
import {registerForCleanup} from './clean-exit';
import {loadConfig} from './config';
import {connectToDrivers} from './drivers';
import {oscInput} from './drivers/osc';
import {COLUMNS, CUES, LAYERS, SLIDES} from './lists';
import {byNumberOrKey} from './utils';

const config = loadConfig('./endpoints.env');

async function main() {
	const osc = await oscInput(config.listenOn);
	const on = osc.on;
	const {lights, resolume, tweens} = await connectToDrivers(config);
	registerForCleanup(osc, lights, resolume);

	console.log('Server started');
	on('/print', ([message]) => {
		console.log(message);
	});

	//-----------------------------------------------------
	// Specific properties

	const adaSlide = tweens.create(
		0,
		v =>
			resolume.setLayerEffectProperty(
				LAYERS.ada,
				'window',
				'anchorx',
				remapValue(v, -2.0, 2.0)
			),
		Easing.Cubic.InOut
	);
	const asimovSlide = tweens.create(
		0,
		v =>
			resolume.setLayerEffectProperty(
				LAYERS.asimov,
				'window',
				'anchorx',
				remapValue(v, -2.0, 2.0)
			),
		Easing.Cubic.InOut
	);

	on('/slide', ([presetName, duration]) => {
		const preset = byNumberOrKey(presetName, SLIDES);
		if (preset === undefined) return;
		adaSlide.endpoint([preset.ada, duration]);
		asimovSlide.endpoint([preset.asimov, duration]);
	});
	on('/slide/ada', adaSlide.endpoint);
	on('/slide/asimov', asimovSlide.endpoint);

	on('/frozen/asimov', ([value]) => {
		resolume.setLayerEffectProperty(
			LAYERS.asimov,
			'freeze',
			'frozensolid',
			value
		);
	});

	const gameOneSpeed = tweens.create(0.5, (v: number) =>
		resolume.setClipEffectProperty(
			LAYERS.background,
			COLUMNS.game1,
			'tunnel',
			'speed',
			v
		)
	);
	const gameTwoSpeed = tweens.create(0.5, (v: number) =>
		resolume.setClipEffectProperty(
			LAYERS.background,
			COLUMNS.game2,
			'tunnel',
			'speed',
			v
		)
	);

	const gameThreeSpeed = tweens.create(0.5, (v: number) =>
		resolume.setClipEffectProperty(
			LAYERS.background,
			COLUMNS.game3,
			'tunnel',
			'speed',
			v
		)
	);

	on('/effect/gamespeed/1', gameOneSpeed.endpoint);
	on('/effect/gamespeed/2', gameTwoSpeed.endpoint);
	on('/effect/gamespeed/3', gameThreeSpeed.endpoint);

	const circleOneSpeed = tweens.create(0.31238, (v: number) =>
		resolume.setClipSourceProperty(
			LAYERS.background,
			COLUMNS.upload,
			'tunnelines/frequency',
			remapValue(v, 0, 3)
		)
	);

	const circleTwoSpeed = tweens.create(0.31238, (v: number) =>
		resolume.setClipSourceProperty(
			LAYERS.background,
			COLUMNS.download,
			'tunnelines/frequency',
			remapValue(v, 0, 3)
		)
	);

	const circleThreeSpeed = tweens.create(0.31238, (v: number) =>
		resolume.setClipSourceProperty(
			LAYERS.background,
			COLUMNS.aurelia,
			'tunnelines/frequency',
			remapValue(v, 0, 3)
		)
	);

	on('/effect/circlespeed/1', circleOneSpeed.endpoint);
	on('/effect/circlespeed/2', circleTwoSpeed.endpoint);
	on('/effect/circlespeed/3', circleThreeSpeed.endpoint);

	on('/effect/pregame', () => {
		circleOneSpeed(0.31238);
		circleTwoSpeed(0.31238);
		circleThreeSpeed(0.31238);
		gameOneSpeed(0.5);
		gameTwoSpeed(0.5);
		gameThreeSpeed(0.5);
	});

	on('/effect/preupload', () => {
		resolume.setClipSourceProperty(
			LAYERS.background,
			COLUMNS.upload,
			'tunnelines/zoom/behaviour/playdirection',
			2
		);
		resolume.setClipSourceProperty(
			LAYERS.background,
			COLUMNS.upload,
			'tunnelines/zoom/behaviour/speed',
			0.71 / 3
		);
	});

	on('/effect/upload', () => {
		circleOneSpeed(1, 2000);
		resolume.setClipSourceProperty(
			LAYERS.background,
			COLUMNS.upload,
			'tunnelines/zoom/behaviour/playdirection',
			0
		);
		resolume.setClipSourceProperty(
			LAYERS.background,
			COLUMNS.upload,
			'tunnelines/zoom/behaviour/speed',
			0.71
		);
		adaSlide(SLIDES.center.ada, 2000);
		asimovSlide(SLIDES.center.asimov, 2000);
	});

	//-----------------------------------------------------
	// Setup

	on('/setup/autofocus', ([camera, value]) => {
		const layerNum = LAYERS.debug;
		const clipNum = camera === 'wide' ? 3 : 4;
		resolume.setClipSourceProperty(
			layerNum,
			clipNum,
			'settings/focusauto',
			value
		);
	});

	//-----------------------------------------------------
	// Lights

	on('/lights', ([cue]) => {
		const cueNumber = byNumberOrKey(cue, CUES);
		if (cueNumber !== undefined) lights.cue(cueNumber);
	});

	//-----------------------------------------------------
	// Generic Resolume

	on('/{column,@}', ([column]) => {
		const num = byNumberOrKey(column, COLUMNS);
		if (num !== undefined) resolume.fireColumn(num);
	});

	on('/{clip,:}', ([layer, clip]) => {
		const layerNum = byNumberOrKey(layer, LAYERS);
		const clipNum = byNumberOrKey(clip, COLUMNS);
		if (layerNum !== undefined && clipNum !== undefined)
			resolume.fireClip(layerNum, clipNum);
	});

	on('/prop', ([layer, ...args]) => {
		const layerNum = byNumberOrKey(layer, LAYERS);
		const hasColumn = args.length === 4;
		const columnNum = hasColumn
			? byNumberOrKey(args.shift(), COLUMNS)
			: undefined;
		const [effect, property, value] = args;
		if (
			layerNum === undefined ||
			(hasColumn && columnNum === undefined) ||
			typeof effect !== 'string' ||
			typeof property !== 'string' ||
			value == undefined ||
			args.length !== 3
		)
			return;

		if (hasColumn && columnNum) {
			resolume.setClipEffectProperty(
				layerNum,
				columnNum,
				effect,
				property,
				value
			);
		} else {
			resolume.setLayerEffectProperty(layerNum, effect, property, value);
		}
	});
}

main().catch(console.error);

function remapValue(
	value: number,
	fromMin: number,
	fromMax: number,
	toMin: number = 0,
	toMax: number = 1
): number {
	return toMin + ((value - fromMin) / (fromMax - fromMin)) * (toMax - toMin);
}
