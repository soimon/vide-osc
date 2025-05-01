import {byNumberOrKey, connectLights} from './drivers/lights';
import {oscInput} from './drivers/osc';
import {connectResolume} from './drivers/resolume';
import {COLUMNS, CUES, LAYERS} from './lists';

async function main() {
	const {on} = await oscInput(1234);
	const lights = await connectLights(8000, '192.168.0.20');
	const resolume = await connectResolume(7000, 'localhost');
	console.log(`Server started`);

	on('/print', ([message]) => {
		console.log(message);
	});

	on('/lights', ([cue]) => {
		const num = byNumberOrKey(cue, CUES);
		if (num !== undefined) lights.cue(num);
	});

	on('/freeze', ([layer]) => {
		const num = byNumberOrKey(layer, LAYERS);
		if (num !== undefined)
			resolume.setLayerEffectProperty(num, 'freeze', 'frozensolid', 1);
	});
	on('/unfreeze', ([layer]) => {
		const num = byNumberOrKey(layer, LAYERS);
		if (num !== undefined)
			resolume.setLayerEffectProperty(num, 'freeze', 'frozensolid', 0);
	});

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
