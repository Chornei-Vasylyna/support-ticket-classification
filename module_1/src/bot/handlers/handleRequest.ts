import { logUserAction } from "@utils/logger.js";
import type { Context, HearsContext } from "grammy";

export const handleRequest = async (ctx: HearsContext<Context>) => {
	logUserAction("User used a keyboard command", {
		userId: ctx.from?.id,
		command: ctx.message?.text
	});
	await ctx.reply("Write your request below please and we will classify it");
};
