let isListening = false;
let isExiting = false;

export const registerForCleanup = (...closers: Closeable[]) => {
	if (!isListening) startListening();
	closables.push(...closers);
};

const startListening = () => {
	process.on('SIGINT', cleanup);
	process.on('SIGTERM', cleanup);
	process.on('exit', cleanup);
	process.on('beforeExit', cleanup);
	isListening = true;
};

const cleanup = () => {
	if (isExiting) return;
	isExiting = true;
	console.log('Cleaning up resources...');
	try {
		closables.forEach(c => c.close());
	} catch (err) {
		console.error('Error closing resource:', err);
	}
	closables = [];
	process.exit(0);
};

let closables: Closeable[] = [];
type Closeable = {close: () => void};
