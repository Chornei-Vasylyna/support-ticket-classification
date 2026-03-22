import { logError, logProgramAction } from "@utils/logger.js";
import { shuffleWithSeed } from "@utils/shuffle.js";
import natural from "natural";
import { SHUFFLE_SEED, TRAIN_RATIO } from "./constants.js";
import { trainingData } from "./trainingData.js";
import type { ModelStats, RequestLabel, TrainingExample } from "./types.js";

const classifier = new natural.BayesClassifier();

const preprocess = (text: string) => text.toLowerCase();

let modelStats: ModelStats | null = null;

const calculateStats = (examples: TrainingExample[]) => {
	let correct = 0;
	let total = 0;

	examples.forEach((example: TrainingExample) => {
		const predicted = classifier.classify(
			preprocess(example.text),
		) as RequestLabel;
		if (predicted === example.label) {
			correct += 1;
		}
		total += 1;
	});

	const accuracy = total === 0 ? 0 : correct / total;

	return { accuracy, total, correct };
};

try {
	const shuffled = shuffleWithSeed(trainingData, SHUFFLE_SEED);
	const trainSize = Math.max(1, Math.floor(shuffled.length * TRAIN_RATIO));
	const testSize = shuffled.length - trainSize;

	const trainSet = shuffled.slice(0, trainSize);
	const testSet = shuffled.slice(trainSize);

	logProgramAction("Starting classifier training", {
		examplesCount: trainingData.length,
		trainSize,
		testSize,
		trainRatio: TRAIN_RATIO,
	});

	trainSet.forEach((example: TrainingExample) => {
		const text = preprocess(example.text);
		classifier.addDocument(text, example.label);
	});

	classifier.train();
	logProgramAction("Classifier training completed successfully");

	const stats = calculateStats(testSet);
	modelStats = {
		...stats,
		trainSize,
		testSize,
		trainRatio: TRAIN_RATIO,
	};
	logProgramAction("Classifier evaluation completed", {
		accuracy: modelStats.accuracy,
		total: modelStats.total,
		correct: modelStats.correct,
		trainSize: modelStats.trainSize,
		testSize: modelStats.testSize,
	});
} catch (e) {
	const errorMessage = e instanceof Error ? e.message : String(e);
	logError("Failed to train classifier", { error: errorMessage });
	throw e;
}

export const classifyText = (text: string) => {
	const preprocessed = preprocess(text);
	return classifier.classify(preprocessed) as RequestLabel;
};

export const getModelStats = () => modelStats;
