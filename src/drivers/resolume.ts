import {Argument, oscOutput} from './osc';

// Internal helper functions (not exported)

export async function connectResolume(port: number, host?: string) {
	const destination = await oscOutput(port, host);

	const fireColumn = (n: number) => destination.send(addressColumn(n).fire());
	const fireClip = (layer: number, clip: number) =>
		destination.send(addressClip(layer, clip).fire());

	const setLayerEffectProperty = (
		layer: number,
		effect: string,
		property: string,
		value: Argument
	) => {
		destination.send(
			addressLayer(layer).effect(effect).property(property),
			[value]
		);
	};

	const setClipEffectProperty = (
		layer: number,
		clip: number,
		effect: string,
		property: string,
		value: Argument
	) => {
		destination.send(
			addressClip(layer, clip).effect(effect).property(property),
			[value]
		);
	};

	return {
		fireColumn,
		fireClip,
		setLayerEffectProperty,
		setClipEffectProperty,
	};
}

// Helper functions to build OSC addresses

export const addressLayer = (layer: number) => {
	const path = `/composition/layers/${layer}`;
	return {effect: _effect(path)};
};
export const addressColumn = (column: number) => {
	const path = `/composition/columns/${column}`;
	return {fire: () => `${path}/connect`};
};
export const addressClip = (layer: number, clip: number) => {
	const path = `/composition/layers/${layer}/clips/${clip}`;
	return {effect: _effect(path), fire: () => `${path}/connect`};
};

const _effect = (base: string) => (effect: string) => {
	let path = `${base}/video/effects/${effect}`;
	return {
		property: (property: string) => `${path}/effect/${property}`,
		opacity: () => `${path}/opacity`,
		bypassed: () => `${path}/bypassed`,
	};
};
