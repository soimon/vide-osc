import OSC from 'osc-js';

//----------------------------------------------------------------
// Receiver

export const oscInput = async (port: number, host?: string) => {
	const osc = await getOSCListener(port, host);

	return {
		on: osc.listener,
		close: osc.close,
	};
};

const getOSCListener = async (port: number, host: string = '0.0.0.0') =>
	new Promise<{listener: OscEventHandler; close: () => void}>(resolve => {
		const osc = new OSC({
			plugin: new OSC.DatagramPlugin(),
		});
		osc.on('open', () => {
			resolve({
				listener: (path, callback) =>
					osc.on(path, (m: OSC.Message) => m && callback(m.args, m)),
				close: () => osc.close(),
			});
		});
		osc.on('error', (err: Error) => {
			console.log(err);
		});
		osc.open({port, host});
	});

type OscEventHandler = (
	eventName: string,
	callback: (args: OSC.Message['args'], message: OSC.Message) => void
) => void;

//----------------------------------------------------------------
// Sender

export const oscOutput = async (port: number, host?: string) => {
	const sender = await getOSCSender(port, host);
	return {
		send: sender.send,
		setter: convertSenderToSetter(sender.send),
		close: sender.close,
	};
};

const getOSCSender = async (port: number, host?: string) =>
	new Promise<{send: Sender; close: () => void}>(resolve => {
		const osc = new OSC({
			plugin: new OSC.DatagramPlugin({send: {port, host}} as any),
		});
		osc.on('open', () => {});
		osc.open();
		resolve({
			send: (address, args = [], types) => {
				// console.log(address, args, types);
				if (types) {
					const typedArgs = types.map((t, i) => ({
						type: t,
						value: args[i] ?? 0,
					}));
					const msg = new (OSC.TypedMessage as any)(
						address,
						typedArgs
					);
					osc.send(msg);
				} else osc.send(new OSC.Message(address, ...args));
			},
			close: () => osc.close(),
		});
	});

const convertSenderToSetter =
	(sender: Sender) =>
	<T extends Argument[] = Argument[]>(address: string, types?: Types) => {
		return (...args: T) => {
			sender(address, args, types);
		};
	};

export type Sender = (
	address: string,
	args?: Argument[],
	types?: Types
) => void;
export type Argument = number | string | Blob | true | false | null | number;
export type Types = Parameters<OSC.TypedMessage['add']>[0][];
