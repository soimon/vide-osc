import {Config} from './config';
import {connectLights} from './drivers/lights';
import {connectResolume} from './drivers/resolume';
import {connectTweens} from './drivers/tweens';

export async function connectToDrivers(config: Config) {
	const lights = await connectLights(
		config.lighting.port,
		config.lighting.host
	);
	const resolume = await connectResolume(
		config.resolume.port,
		config.resolume.host
	);
	const tweens = await connectTweens();
	return {lights, resolume, tweens};
}
