import { logUserAction } from "@utils/logger.js";
import type { CommandContext, Context, HearsContext } from "grammy";

export const handleHelp = async (ctx: HearsContext<Context> | CommandContext<Context>) => {
	logUserAction("User used a command", {
		userId: ctx.from?.id,
		command: ctx.message?.text,
	});
	await ctx.reply(
		"Just write the text of your problem below (for example: 'can't log in to my account'), and I will automatically determine the type of your request.",
	);
};
