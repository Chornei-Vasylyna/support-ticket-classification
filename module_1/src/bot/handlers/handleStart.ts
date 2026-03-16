import { mainKeyboard } from "@utils/keyboard.js";
import { logUserAction } from "@utils/logger.js";
import type { CommandContext, Context } from "grammy";

export const handleStart = async (ctx: CommandContext<Context>) => {
	logUserAction("User started the bot", {
		userId: ctx.from?.id,
		command: ctx.message?.text,
	});
	await ctx.reply(
		`Hi!👋\nYou're using the support service bot.\nSend your request below or use the menu.`,
		{ reply_markup: mainKeyboard },
	);
};
