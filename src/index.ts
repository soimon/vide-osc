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
		if (num !== undefined) resolume.setFrozen(num, true);
	});
	on('/unfreeze', ([layer]) => {
		const num = byNumberOrKey(layer, LAYERS);
		if (num !== undefined) resolume.setFrozen(num, false);
	});

	on('/column', ([column]) => {
		const num = byNumberOrKey(column, COLUMNS);
		if (num !== undefined) resolume.column(num);
	});
}

main().catch(console.error);
