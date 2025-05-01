import {oscOutput} from './osc';

export async function connectResolume(port: number, host?: string) {
	const destination = await oscOutput(port, host);

	const column = (n: number) =>
		destination.send(`/composition/columns/${n}/connect`);
	const setFrozen = (layer: number, status: boolean) =>
		destination.send(
			`/composition/layers/${layer}/video/effects/freeze/effect/frozensolid`,
			[status ? 1 : 0]
		);

	return {column, setFrozen};
}
