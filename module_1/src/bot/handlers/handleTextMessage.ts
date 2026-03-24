import { CATEGORIES, COMMANDS } from "@constants";
import { classifyText } from "@nlp/model.js";
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
		const trimmedInput = userInput.trim();

		logUserAction("Text message received", {
			userId: ctx.from?.id,
			message: userInput,
		});

		const alnumChars = trimmedInput.match(/[\p{L}\p{N}]/gu) ?? [];

		if (alnumChars.length === 0) {
			logUserAction("Rejected message with only symbols", {
				userId: ctx.from?.id,
				message: userInput,
			});
			await ctx.reply("❌ Please send a valid text message, not only symbols");
			return;
		}

		if (alnumChars.length === 1) {
			logUserAction("Rejected message with single letter", {
				userId: ctx.from?.id,
				message: userInput,
			});
			await ctx.reply("❌ Please send a longer text message");
			return;
		}

		if (trimmedInput.startsWith("/")) {
			const knownSlashCommands = new Set(["/start", "/help", "/statistics"]);
			if (!knownSlashCommands.has(trimmedInput)) {
				logUserAction("Rejected unknown command", {
					userId: ctx.from?.id,
					message: userInput,
				});
				await ctx.reply("❌ Such a command does not exist");
				return;
			}
		}

		const label = classifyText(userInput);
		logUserAction("Request classified successfully", {
			userId: ctx.from?.id,
			category: CATEGORIES[label],
		});
		await ctx.reply(
			`🤖 Request detected:\n\n"${userInput}"\n\nCategory: ${CATEGORIES[label]}`,
		);
		await ctx.reply("Are there any other requests?");
	} catch (e) {
		logError("Failed to process text message", {
			userId: ctx.from?.id,
			message: userInput,
			error: e instanceof Error ? e.message : String(e),
		});
		await ctx.reply("An error occurred while processing the text..");
	}
};
