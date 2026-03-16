import { COMMANDS } from "@constants";
import { Keyboard } from "grammy";

export const mainKeyboard = new Keyboard()
	.text(COMMANDS.sendRequest)
	.text(COMMANDS.statistics)
	.text(COMMANDS.help);
