import { appendFileSync } from "node:fs";
import config from "@configs/config.json" with { type: "json" };

const log = (
	file: string,
	level: string,
	message: string,
	metadata?: Record<string, unknown>,
) => {
	const timestamp = new Date().toISOString();
	const metaStr = metadata ? ` | ${JSON.stringify(metadata)}` : "";
	const entry = `[${timestamp}] [${level}] ${message}${metaStr}\n`;
	appendFileSync(file, entry);
};

export const logUserAction = (
	message: string,
	metadata?: Record<string, unknown>,
) => log(config.userActionsLogFile, "INFO", message, metadata);

export const logProgramAction = (
	message: string,
	metadata?: Record<string, unknown>,
) => log(config.programActionsLogFile, "INFO", message, metadata);

export const logError = (message: string, metadata?: Record<string, unknown>) =>
	log(config.programActionsLogFile, "ERROR", message, metadata);

export const logWarn = (message: string, metadata?: Record<string, unknown>) =>
	log(config.programActionsLogFile, "WARN", message, metadata);
