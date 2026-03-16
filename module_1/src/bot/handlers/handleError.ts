import { logError } from "@utils/logger.js";
import type { BotError, Context } from "grammy";
import { GrammyError, HttpError } from "grammy";

export const handleError = (err: BotError<Context>) => {
	const meta = {
		userId: err.ctx.from?.id,
		userAction: err.ctx.message?.text || "unknown action",
	};

	if (err.error instanceof GrammyError) {
		logError(`Telegram API Error: ${err.error.description}`, meta);
	} else if (err.error instanceof HttpError) {
		logError(`Network error: ${err.error.message}`, meta);
	} else {
		const message =
			err.error instanceof Error ? err.error.message : String(err.error);
		logError(`Unexpected error: ${message}`, meta);
	}
};
