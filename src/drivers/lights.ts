import {oscOutput} from './osc';

export async function connectLights(port: number, host?: string) {
	const destination = await oscOutput(port, host);
	const cue = (n: number) => destination.send(`/eos/cue/${n}/fire`, [], []);
	return {
		cue,
		close: destination.close,
	};
}
