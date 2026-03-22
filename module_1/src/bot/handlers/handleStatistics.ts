import { getModelStats } from "@nlp/model.js";
import { logUserAction } from "@utils/logger.js";
import type { Context, HearsContext } from "grammy";

const formatPercent = (value: number) => `${(value * 100).toFixed(2)}%`;

export const handleStatistics = async (ctx: HearsContext<Context>) => {
	logUserAction("User used a keyboard command", {
		userId: ctx.from?.id,
		command: ctx.message?.text,
	});

	const stats = getModelStats();
	if (!stats) {
		await ctx.reply(
			"Statistics are not available yet. Please try again later.",
		);
		return;
	}

	await ctx.reply(
		`📊 Model statistics\n\n` +
			`Split: ${Math.round(stats.trainRatio * 100)}/${
				100 - Math.round(stats.trainRatio * 100)
			}% (train/test)\n` +
			`Train: ${stats.trainSize} | Test: ${stats.testSize}\n` +
			`Accuracy: ${formatPercent(stats.accuracy)}\n` +
			`Correct: ${stats.correct}/${stats.total}`,
	);
	await ctx.reply("Write your request below please and I will classify it");
};
