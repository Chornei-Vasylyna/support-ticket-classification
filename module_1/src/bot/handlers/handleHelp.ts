import { logUserAction } from "@utils/logger.js";
import type { Context, HearsContext } from "grammy";

export const handleHelp = async (ctx: HearsContext<Context>) => {
	logUserAction("User used a keyboard command", {
		userId: ctx.from?.id,
		command: ctx.message?.text
	});
	await ctx.reply(
		"Just write me the text of your problem (for example: 'can't log in to my account'), and I will automatically determine the type of request.",
	);
};
