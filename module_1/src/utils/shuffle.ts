export const shuffleWithSeed = <T>(items: T[], seed: number): T[] => {
	const result = [...items];
	let state = seed >>> 0;
	const random = () => {
		state = (state * 1664525 + 1013904223) >>> 0;
		return state / 0x100000000;
	};

	for (let i = result.length - 1; i > 0; i -= 1) {
		const j = Math.floor(random() * (i + 1));
		const itemI = result[i];
		const itemJ = result[j];
		if (itemI === undefined || itemJ === undefined) {
			continue;
		}
		result[i] = itemJ;
		result[j] = itemI;
	}

	return result;
};
