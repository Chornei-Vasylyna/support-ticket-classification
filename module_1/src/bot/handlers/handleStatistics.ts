import { logUserAction } from "@utils/logger.js";
import type { Context, HearsContext } from "grammy";

export const handleStatistics = async (ctx: HearsContext<Context>) => {
	logUserAction("User used a keyboard command", {
		userId: ctx.from?.id,
		command: ctx.message?.text,
	});
	// There will be statistics handler logic
};
