import * as dotenv from 'dotenv';
import * as fs from 'fs';

export function loadConfig(envPath: string) {
	const {validatePort, validateHost} = getValidatorsForEnvFile(envPath);

	return {
		listenOn: validatePort('LISTEN_ON'),
		lighting: {
			port: validatePort('LIGHTING_PORT'),
			host: validateHost('LIGHTING_HOST'),
		},
		resolume: {
			port: validatePort('RESOLUME_PORT'),
			host: validateHost('RESOLUME_HOST'),
		},
	};
}

export type Config = ReturnType<typeof loadConfig>;

const errorMessages = {
	fileNotFound: (path: string) =>
		`Fout: Het configuratiebestand ${path} is niet gevonden.`,
	invalidPort: (name: string, value: string) =>
		`Fout: "${name}" moet een geldig poortnummer zijn (tussen 1 en 65535). Huidige waarde in het configuratiebestand: "${value}"`,
	invalidHost: (name: string, value: string) =>
		`Fout: "${name}" moet een geldig IP-adres of hostnaam zijn. Huidige waarde in het configuratiebestand: "${value}"`,
	missingVariable: (name: string) =>
		`Fout: "${name}" is niet ingesteld in het configuratiebestand.`,
	fileRead: (path: string, error: string) =>
		`Fout bij het lezen van ${path}: ${error}`,
};

/**
 * Creates validator functions specific to the environment file
 * Handles file loading and validation
 */
function getValidatorsForEnvFile(envPath: string) {
	// Check if file exists
	if (!fs.existsSync(envPath)) {
		console.error(errorMessages.fileNotFound(envPath));
		process.exit(1);
	}

	try {
		dotenv.config({path: envPath});
	} catch (error: any) {
		console.error(errorMessages.fileRead(envPath, error.message));
		process.exit(1);
	}

	return getValidatorsForEnvObject(process.env);
}

/**
 * Creates validator functions specific to the environment
 */
function getValidatorsForEnvObject(env: NodeJS.ProcessEnv) {
	return {
		validatePort: (name: string): number => {
			return validateConfig(
				env,
				name,
				isValidPort,
				v => parseInt(v),
				errorMessages.invalidPort
			);
		},
		validateHost: (name: string): string => {
			return validateConfig(
				env,
				name,
				isValidHostname,
				v => v,
				errorMessages.invalidHost
			);
		},
	};
}

/**
 * Validate and parse configuration variable
 */
function validateConfig<T>(
	env: NodeJS.ProcessEnv,
	name: string,
	validator: (value: T) => boolean,
	parser: (value: string) => T,
	errorMessageFn: (name: string, value: string) => string
): T {
	if (!env[name]) {
		console.error(errorMessages.missingVariable(name));
		process.exit(1);
	}

	const value = env[name] as string;
	const parsedValue = parser(value);

	if (!validator(parsedValue)) {
		console.error(errorMessageFn(name, value));
		process.exit(1);
	}

	return parsedValue;
}

/**
 * Validates a port number
 * @param port The port value to validate
 * @returns True if valid, false otherwise
 */
function isValidPort(port: number): boolean {
	return !isNaN(port) && port > 0 && port <= 65535 && Number.isInteger(port);
}

/**
 * Basic validation for IP address or hostname
 * @param host The hostname or IP address to validate
 * @returns True if valid, false otherwise
 */
function isValidHostname(host: string): boolean {
	// Simple check for localhost
	if (host === 'localhost') return true;

	// Basic IP validation (IPv4)
	const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
	if (ipv4Regex.test(host)) {
		return host
			.split('.')
			.map(Number)
			.every(octet => octet >= 0 && octet <= 255);
	}

	// Basic hostname validation
	const hostnameRegex =
		/^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/;
	return hostnameRegex.test(host);
}
