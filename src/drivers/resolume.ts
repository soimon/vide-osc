import { oscOutput } from './osc';

// Internal helper functions (not exported)

export async function connectResolume(port: number, host?: string) {
	const destination = await oscOutput(port, host);

	const fireColumn = (n: number) => destination.send(addressColumn(n).fire());
	const setFrozen = (layer: number, status: boolean) =>
		destination.send(
			addressLayer(layer).effect('freeze').property('frozensolid'),
			[status ? 1 : 0]
		);

	return { fireColumn, setFrozen };
}

// Helper functions to build OSC addresses

export const addressLayer = (layer: number) => {
	const path = `/composition/layers/${layer}`;
	return { effect: _effect(path) };
}
export const addressClip = (layer: number, clip: number) => {
	const path = `/composition/layers/${layer}/clips/${clip}`;
	return { effect: _effect(path), fire: () => `${path}/connect` };
}
export const addressColumn = (column: number) => {
	const path = `/composition/columns/${column}`;
	return { fire: () => `${path}/connect` };
}

const _effect = (base:string) => (effect:string) =>
{
	let path = `${base}/video/effects/${effect}`;
	return { property: (property:string) => `${path}/effect/${property}`, opacity: () => `${path}/opacity`, bypassed: () => `${path}/bypassed` };
}