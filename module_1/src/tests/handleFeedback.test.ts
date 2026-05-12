import assert from "node:assert/strict";
import crypto from "node:crypto";
import { test } from "node:test";

process.env.FEEDBACK_STORE_DISABLE_PERSISTENCE = "1";

import { handleFeedback } from "@handlers/handleFeedback.js";
import { feedbackStore } from "../feedback/store.js";

const createCallbackContext = (data: string) => {
	const callbackAnswers: string[] = [];
	let editMarkupCalls = 0;

	return {
		ctx: {
			from: { id: 123 },
			callbackQuery: { data },
			answerCallbackQuery: async ({ text }: { text: string }) => {
				callbackAnswers.push(text);
			},
			editMessageReplyMarkup: async () => {
				editMarkupCalls += 1;
			},
		},
		callbackAnswers,
		get editMarkupCalls() {
			return editMarkupCalls;
		},
	};
};

test("handleFeedback returns error when record is not found", async () => {
	const missingId = crypto.randomUUID();
	const { ctx, callbackAnswers } = createCallbackContext(`fb:1:${missingId}`);

	await handleFeedback(ctx as never);

	assert.equal(callbackAnswers.length, 1);
	assert.ok(callbackAnswers[0]?.includes("record not found"));
});

test("handleFeedback accepts correct feedback for an existing record", async () => {
	const recordId = feedbackStore.createPendingClassification({
		userId: 123,
		text: "Test message",
		predictedLabel: "technical",
	});

	const { ctx, callbackAnswers } = createCallbackContext(`fb:1:${recordId}`);
	await handleFeedback(ctx as never);

	assert.equal(callbackAnswers.length, 1);
	assert.ok(callbackAnswers[0]?.includes("Thanks"));
});
