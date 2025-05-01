import OSC from 'osc-js';

//----------------------------------------------------------------
// Receiver

export const oscInput = async (port: number, host?: string) => {
	const listener = await getOSCListener(port, host);

	return {
		on: listener,
	};
};

const getOSCListener = async (
	port: number,
	host: string = '0.0.0.0'
): Promise<OscEventHandler> =>
	new Promise(resolve => {
		const osc = new OSC({
			plugin: new OSC.DatagramPlugin(),
		});
		osc.on('open', () => {
			resolve((path, callback) =>
				osc.on(path, (m: OSC.Message) => m && callback(m.args, m))
			);
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
	return {send: sender, setter: convertSenderToSetter(sender)};
};

const getOSCSender = async (port: number, host?: string) =>
	new Promise<Sender>(resolve => {
		const osc = new OSC({
			plugin: new OSC.DatagramPlugin({send: {port, host}} as any),
		});
		osc.on('open', () => {});
		osc.open();
		resolve((address, args = [], types) => {
			console.log('send', address, args, types);
			if (types) {
				const typedArgs = types.map((t, i) => ({
					type: t,
					value: args[i] ?? 0,
				}));
				const msg = new (OSC.TypedMessage as any)(address, typedArgs);
				osc.send(msg);
			} else osc.send(new OSC.Message(address, ...args));
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
