import { logError, logProgramAction } from "@utils/logger.js";
import { shuffleWithSeed } from "@utils/shuffle.js";
import natural from "natural";
import { feedbackStore } from "../feedback/store.js";
import { SHUFFLE_SEED, TRAIN_RATIO } from "./constants.js";
import { trainingData } from "./trainingData.js";
import type { ModelStats, RequestLabel, TrainingExample } from "./types.js";

let classifier = new natural.BayesClassifier();

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

const trainClassifier = (examples: TrainingExample[]) => {
	const shuffled = shuffleWithSeed(examples, SHUFFLE_SEED);
	const trainSize = Math.max(1, Math.floor(shuffled.length * TRAIN_RATIO));
	const testSize = shuffled.length - trainSize;

	const trainSet = shuffled.slice(0, trainSize);
	const testSet = shuffled.slice(trainSize);

	classifier = new natural.BayesClassifier();

	trainSet.forEach((example: TrainingExample) => {
		const text = preprocess(example.text);
		classifier.addDocument(text, example.label);
	});

	classifier.train();
	const stats = calculateStats(testSet);
	modelStats = {
		...stats,
		trainSize,
		testSize,
		trainRatio: TRAIN_RATIO,
	};
};

const getAllTrainingData = () => {
	const feedbackExamples = feedbackStore.getConfirmedTrainingExamples();
	return [...trainingData, ...feedbackExamples];
};

export const retrainModelFromFeedback = () => {
	try {
		const all = getAllTrainingData();
		logProgramAction("Retraining classifier (including feedback)", {
			examplesCount: all.length,
			feedbackExamples: all.length - trainingData.length,
		});
		trainClassifier(all);
		if (modelStats) {
			const { accuracy, total, correct } = modelStats;
			logProgramAction("Classifier retrained successfully", {
				accuracy,
				total,
				correct,
			});
		}
	} catch (e) {
		const errorMessage = e instanceof Error ? e.message : String(e);
		logError("Failed to retrain classifier", { error: errorMessage });
	}
};

try {
	const all = getAllTrainingData();
	logProgramAction("Starting classifier training", {
		examplesCount: all.length,
		feedbackExamples: all.length - trainingData.length,
		trainRatio: TRAIN_RATIO,
	});
	trainClassifier(all);
	logProgramAction("Classifier training completed successfully");
	if (modelStats) {
		const { accuracy, total, correct, trainSize, testSize } = modelStats;
		logProgramAction("Classifier evaluation completed", {
			accuracy,
			total,
			correct,
			trainSize,
			testSize,
		});
	}
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
