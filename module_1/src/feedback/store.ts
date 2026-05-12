import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type { RequestLabel, TrainingExample } from "../nlp/types.js";

export type FeedbackStatus = "pending" | "correct" | "incorrect";

export type FeedbackRecord = {
	id: string;
	userId: number;
	text: string;
	predictedLabel: RequestLabel;
	status: FeedbackStatus;
	createdAt: string;
	updatedAt: string;
};

type FeedbackStoreShape = {
	version: 1;
	records: FeedbackRecord[];
};

const DEFAULT_LIMIT = 10;

const getStoreFilePath = () => {
	const envPath = process.env.FEEDBACK_STORE_PATH;
	if (envPath && envPath.trim().length > 0) return envPath;
	return path.resolve(process.cwd(), "data", "feedback.json");
};

const readJSON = (filePath: string): FeedbackStoreShape => {
	try {
		if (!fs.existsSync(filePath)) {
			return { version: 1, records: [] };
		}
		const raw = fs.readFileSync(filePath, "utf8");
		const parsed = JSON.parse(raw) as unknown;
		if (
			typeof parsed === "object" &&
			parsed !== null &&
			"records" in parsed &&
			Array.isArray((parsed as { records?: unknown }).records)
		) {
			return {
				version: 1,
				records: (parsed as { records: FeedbackRecord[] }).records,
			};
		}
		return { version: 1, records: [] };
	} catch {
		return { version: 1, records: [] };
	}
};

const writeJSONAtomic = (filePath: string, data: FeedbackStoreShape) => {
	if (process.env.FEEDBACK_STORE_DISABLE_PERSISTENCE === "1") return;

	const dir = path.dirname(filePath);
	if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

	const tmp = `${filePath}.tmp`;
	fs.writeFileSync(tmp, `${JSON.stringify(data, null, 2)}\n`, "utf8");
	fs.renameSync(tmp, filePath);
};

class FeedbackStore {
	private cache: FeedbackStoreShape | null = null;

	private load(): FeedbackStoreShape {
		if (!this.cache) {
			this.cache = readJSON(getStoreFilePath());
		}
		return this.cache;
	}

	private save(next: FeedbackStoreShape) {
		this.cache = next;
		writeJSONAtomic(getStoreFilePath(), next);
	}

	createPendingClassification(input: {
		userId: number | undefined;
		text: string;
		predictedLabel: RequestLabel;
	}): string {
		const userId = input.userId;
		if (typeof userId !== "number") {
			return crypto.randomUUID();
		}

		const now = new Date().toISOString();
		const id = crypto.randomUUID();
		const store = this.load();
		const record: FeedbackRecord = {
			id,
			userId,
			text: input.text,
			predictedLabel: input.predictedLabel,
			status: "pending",
			createdAt: now,
			updatedAt: now,
		};
		this.save({ ...store, records: [...store.records, record] });
		return id;
	}

	setFeedback(
		recordId: string,
		status: Exclude<FeedbackStatus, "pending">,
		userId: number | undefined,
	): FeedbackRecord | null {
		if (typeof userId !== "number") return null;
		const store = this.load();
		let updated: FeedbackRecord | null = null;

		const nextRecords = store.records.map((r) => {
			if (r.id !== recordId) return r;
			if (r.userId !== userId) return r;
			updated = { ...r, status, updatedAt: new Date().toISOString() };
			return updated;
		});

		if (!updated) return null;
		this.save({ ...store, records: nextRecords });
		return updated;
	}

	getUserHistory(
		userId: number | undefined,
		limit = DEFAULT_LIMIT,
	): FeedbackRecord[] {
		if (typeof userId !== "number") return [];
		const store = this.load();
		return store.records
			.filter((r) => r.userId === userId)
			.slice()
			.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
			.slice(0, limit);
	}

	getConfirmedTrainingExamples(): TrainingExample[] {
		const store = this.load();
		const seen = new Set<string>();
		const examples: TrainingExample[] = [];

		for (const r of store.records) {
			if (r.status !== "correct") continue;
			const key = `${r.predictedLabel}::${r.text}`;
			if (seen.has(key)) continue;
			seen.add(key);
			examples.push({ text: r.text, label: r.predictedLabel });
		}

		return examples;
	}
}

export const feedbackStore = new FeedbackStore();
