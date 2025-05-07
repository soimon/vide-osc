import {registerForCleanup} from './clean-exit';
import {loadConfig} from './config';
import {connectToDrivers} from './drivers';
import {oscInput} from './drivers/osc';
import {COLUMNS, CUES, LAYERS} from './lists';
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

	on('/value', tweens.create(0, v => console.log(v)).endpoint);
	on('/asimov/frozen', ([v]) =>
		resolume.setLayerEffectProperty(LAYERS.a, 'freeze', 'frozensolid', v)
	);

	//-----------------------------------------------------
	// Setup

	on('/setup/autofocus', ([camera, value]) => {
		const layerNum = LAYERS.debug;
		const clipNum = camera === 'wide' ? 3 : 4;
		resolume.setClipSourceProperty(layerNum, clipNum, 'focusauto', value);
	});

	//-----------------------------------------------------
	// Lights

	on('/lights', ([cue]) => {
		const cueNumber = byNumberOrKey(cue, CUES);
		if (cueNumber !== undefined) lights.cue(cueNumber);
	});

	//-----------------------------------------------------
	// Generic Resolume

	on('/column', ([column]) => {
		const num = byNumberOrKey(column, COLUMNS);
		if (num !== undefined) resolume.fireColumn(num);
	});

	on('/clip', ([layer, clip]) => {
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
