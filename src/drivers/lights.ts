import {oscOutput} from './osc';

export async function connectLights(port: number, host?: string) {
	const destination = await oscOutput(port, host);
	const cue = (n: number) => destination.send(`/eos/cue/${n}/fire`, [], []);
	return {cue};
}

export const byNumberOrKey = (input: any, MAP: Record<string, number>) =>
	typeof input === 'string' && input in MAP
		? MAP[input]
		: typeof input === 'number'
		? input
		: (console.error('Invalid input:', input), undefined);
