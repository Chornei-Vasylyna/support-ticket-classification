import { CATEGORIES } from "@constants";
import { logUserAction } from "@utils/logger.js";
import type { CommandContext, Context, HearsContext } from "grammy";
import { feedbackStore } from "../../feedback/store.js";

const statusIcon = (status: string) => {
	if (status === "correct") return "✅";
	if (status === "incorrect") return "❌";
	return "⏳";
};

export const handleHistory = async (
	ctx: HearsContext<Context> | CommandContext<Context>,
) => {
	logUserAction("User requested history", {
		userId: ctx.from?.id,
		command: ctx.message?.text,
	});

	const history = feedbackStore.getUserHistory(ctx.from?.id);
	if (history.length === 0) {
		await ctx.reply(
			"📜 Your history is empty. Send a request to get it classified.",
		);
		return;
	}

	const lines = history.map((r, idx) => {
		const category = CATEGORIES[r.predictedLabel];
		const when = new Date(r.createdAt).toLocaleString();
		const text = r.text.length > 120 ? `${r.text.slice(0, 117)}...` : r.text;
		return (
			`${idx + 1}) ${statusIcon(r.status)} ${category}\n` +
			`   ${when}\n` +
			`   "${text}"`
		);
	});

	await ctx.reply(
		`📜 Your history (latest ${history.length})\n\n${lines.join("\n\n")}`,
	);
};
