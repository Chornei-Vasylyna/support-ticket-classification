export type RequestLabel = "technical" | "financial" | "informational";

export interface TrainingExample {
	text: string;
	label: RequestLabel;
}

export interface ModelStats {
	trainSize: number;
	testSize: number;
	trainRatio: number;
	accuracy: number;
	total: number;
	correct: number;
}
