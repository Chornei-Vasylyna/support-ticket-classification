import { config } from "@configs/env.js";
import { COMMANDS } from "@constants";
import { handleError } from "@handlers/handleError.js";
import { handleHelp } from "@handlers/handleHelp.js";
import { handleInvalidMessage } from "@handlers/handleInvalidMessage.js";
import { handleRequest } from "@handlers/handleRequest.js";
import { handleStart } from "@handlers/handleStart.js";
import { handleStatistics } from "@handlers/handleStatistics.js";
import { handleTextMessage } from "@handlers/handleTextMessage.js";
import { Bot } from "grammy";

export const bot = new Bot(config.BOT_TOKEN);

bot.command("start", handleStart);

bot.hears(COMMANDS.sendRequest, handleRequest);
bot.hears(COMMANDS.statistics, handleStatistics);
bot.hears(COMMANDS.help, handleHelp);

bot.on("message:text", handleTextMessage);
bot.on("message", handleInvalidMessage);

bot.catch(handleError);
