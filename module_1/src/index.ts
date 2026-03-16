import { bot } from "@bot/bot.js";
import { logError, logProgramAction } from "@utils/logger.js";

try {
	bot.start();
	logProgramAction("Bot started successfully");
} catch (e) {
	const errorMessage = e instanceof Error ? e.message : String(e);
	logError("Failed to start bot", { error: errorMessage });
	process.exit(1);
}
