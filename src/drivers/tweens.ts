import {Easing, Group, Tween} from '@tweenjs/tween.js';

export type EasingFunction = (amount: number) => number;
export type TweenFunction = {
	(targetValue: number, durationMs?: number | string | null): void;
	endpoint: (args: any[], message?: any) => void;
};

export const connectTweens = async () => {
	const tweenGroup = new Group();

	// Start animation loop
	function animate() {
		const now = performance.now();
		tweenGroup.update(now);
		setTimeout(animate, 1000 / 60);
	}
	animate();

	const tweenHandler = createTweenHandler(tweenGroup);

	return {
		create: tweenHandler.createTween,
		stopAll: tweenHandler.stopAll,
	};
};

function createTweenHandler(tweenGroup: Group) {
	function createTween(
		initialValue: number,
		setter: (value: number) => void,
		easing: EasingFunction = Easing.Quadratic.InOut
	): TweenFunction {
		let currentValue = initialValue;
		let activeTween: Tween<{value: number}> | null = null;

		setter(initialValue);

		const tweenFn = (
			targetValue: number,
			durationMs: number | null | string = 0
		) => {
			const parsedDuration =
				typeof durationMs === 'string'
					? parseDurationString(durationMs)
					: durationMs !== null
					? durationMs
					: 0;

			if (activeTween) {
				activeTween.stop();
				tweenGroup.remove(activeTween);
				activeTween = null;
			}

			if (currentValue === targetValue) {
				setter(currentValue);
				return;
			}

			if (parsedDuration === 0) {
				currentValue = targetValue;
				setter(targetValue);
				return;
			}

			const obj = {value: currentValue};
			const tween = new Tween(obj)
				.to({value: targetValue}, parsedDuration)
				.easing(easing)
				.onUpdate(() => {
					currentValue = obj.value;
					setter(obj.value);
				})
				.onComplete(() => {
					activeTween = null;
				});

			tweenGroup.add(tween);
			tween.start();
			activeTween = tween;
		};

		tweenFn.endpoint = createEndpointHandler(tweenFn);

		return tweenFn;
	}

	function createEndpointHandler(
		tweenFn: (value: number, duration?: number | string | null) => void
	) {
		return function endpoint(args: any[], message?: any) {
			const [value, duration] = args;
			if (value === undefined) return;

			const parsedValue =
				typeof value === 'number'
					? value
					: typeof value === 'string'
					? parseFloat(value)
					: 0;

			const durationArg: number | string =
				typeof duration === 'number' || typeof duration === 'string'
					? duration
					: typeof duration === 'boolean'
					? duration
						? 1
						: 0
					: 0;

			tweenFn(parsedValue, durationArg);
		};
	}

	function stopAll() {
		tweenGroup.removeAll();
	}

	return {
		createTween,
		stopAll,
	};
}

/**
 * Parses a duration string or number into milliseconds.
 *
 * @param input - The duration to parse, which can be:
 *   - A number (interpreted as milliseconds)
 *   - A string with formats like:
 *     - "100" (interpreted as milliseconds)
 *     - "100ms" (milliseconds)
 *     - "5s" (seconds)
 *     - "1m" (minutes)
 *     - "1m30s" (minutes and seconds)
 *
 * @example
 * parseDurationString(500)      // 500 (milliseconds)
 * parseDurationString("500")    // 500 (milliseconds)
 * parseDurationString("500ms")  // 500 (milliseconds)
 * parseDurationString("2.5s")     // 2500 (milliseconds)
 * parseDurationString("1m30s")  // 90000 (milliseconds)
 *
 * @returns The duration in milliseconds.
 */
export function parseDurationString(input: string | number): number {
	if (typeof input === 'number') return input;
	if (!input) return 0;
	const s = input.trim().toLowerCase();
	if (/^\d+(\.\d+)?$/.test(s)) return parseFloat(s);

	let total = 0;
	const regex = /(\d+(?:\.\d+)?)(ms|s|m)?/g;
	let match;
	let lastUnit = null;
	while ((match = regex.exec(s)) !== null) {
		let [_, value, unit] = match;
		if (!value) continue;
		const n = parseFloat(value);
		if (!unit) {
			if (lastUnit === 'm') {
				total += n * 1000;
				lastUnit = 's';
			} else if (lastUnit === 's') {
				total += n;
				lastUnit = 'ms';
			} else {
				total += n;
				lastUnit = 'ms';
			}
		} else if (unit === 'ms') {
			total += n;
			lastUnit = 'ms';
		} else if (unit === 's') {
			total += n * 1000;
			lastUnit = 's';
		} else if (unit === 'm') {
			total += n * 60 * 1000;
			lastUnit = 'm';
		}
	}
	return total;
}
