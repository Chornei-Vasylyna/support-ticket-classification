import { logUserAction } from "@utils/logger.js";
import type { Context } from "grammy";

export const handleInvalidMessage = async (ctx: Context) => {
	await ctx.reply(
		"❌ Please send the actual text message. Pictures, stickers, and files are not supported for analysis.",
	);
	logUserAction("Received unsupported media type", {
		userId: ctx.from?.id,
	});
};
