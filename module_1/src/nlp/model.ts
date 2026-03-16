import { logError, logProgramAction } from "@utils/logger.js";
import natural from "natural";
import type { RequestLabel, TrainingExample } from "./trainingData.js";
import { trainingData } from "./trainingData.js";

const classifier = new natural.BayesClassifier();

const preprocess = (text: string) => text.toLowerCase();

try {
	logProgramAction("Starting classifier training", {
		examplesCount: trainingData.length,
	});

	trainingData.forEach((example: TrainingExample) => {
		const text = preprocess(example.text);
		classifier.addDocument(text, example.label);
	});

	classifier.train();
	logProgramAction("Classifier training completed successfully");
} catch (e) {
	const errorMessage = e instanceof Error ? e.message : String(e);
	logError("Failed to train classifier", { error: errorMessage });
	throw e;
}

export const classifyText = (text: string) => {
	const preprocessed = preprocess(text);
	return classifier.classify(preprocessed) as RequestLabel;
};
