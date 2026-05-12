import { retrainModelFromFeedback } from "@nlp/model.js";
import { logError, logUserAction } from "@utils/logger.js";
import type { Context } from "grammy";
import { feedbackStore } from "../../feedback/store.js";

const parseFeedbackData = (data: string) => {
	const match = /^fb:(0|1):(.+)$/.exec(data);
	if (!match) return null;
	const isCorrect = match[1] === "1";
	const recordId = match[2];
	if (!recordId) return null;
	return { isCorrect, recordId };
};

export const handleFeedback = async (ctx: Context) => {
	try {
		const data = ctx.callbackQuery?.data;
		if (!data) return;

		const parsed = parseFeedbackData(data);
		if (!parsed) return;

		const updated = feedbackStore.setFeedback(
			parsed.recordId,
			parsed.isCorrect ? "correct" : "incorrect",
			ctx.from?.id,
		);

		if (!updated) {
			await ctx.answerCallbackQuery({
				text: "❌ Unable to save feedback (record not found)",
			});
			return;
		}

		logUserAction("User submitted feedback", {
			userId: ctx.from?.id,
			recordId: parsed.recordId,
			result: parsed.isCorrect ? "correct" : "incorrect",
			predictedLabel: updated?.predictedLabel,
		});

		await ctx.answerCallbackQuery({
			text: parsed.isCorrect
				? "✅ Thanks! I'll take this into account."
				: "❌ Got it. Thanks for the feedback.",
		});

		try {
			await ctx.editMessageReplyMarkup({
				reply_markup: { inline_keyboard: [] },
			});
		} catch {}

		if (parsed.isCorrect) {
			retrainModelFromFeedback();
		}
	} catch (e) {
		logError("Failed to handle feedback callback", {
			userId: ctx.from?.id,
			error: e instanceof Error ? e.message : String(e),
		});

		try {
			await ctx.answerCallbackQuery({
				text: "❌ Failed to save feedback",
			});
		} catch {}
	}
};
