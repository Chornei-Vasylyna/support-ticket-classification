import { COMMANDS } from "@constants";
import { logError, logUserAction } from "@utils/logger.js";
import type { Context } from "grammy";

export const handleTextMessage = async (ctx: Context) => {
	const userInput = ctx.message?.text;

	if (
		!userInput ||
		[COMMANDS.sendRequest, COMMANDS.statistics, COMMANDS.help].includes(
			userInput,
		)
	)
		return;

	try {
		logUserAction("Text message received", {
			userId: ctx.from?.id,
			message: userInput,
		});

		await ctx.reply(
			`You wrote: "${userInput}". \n\n🤖 The analysis is still under development, but I have already logged this request.`,
		);
	} catch (e) {
		logError("Failed to process text message", {
			userId: ctx.from?.id,
			message: userInput,
			error: e instanceof Error ? e.message : String(e),
		});
		await ctx.reply("An error occurred while processing the text..");
	}
};
