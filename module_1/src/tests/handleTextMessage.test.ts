import assert from "node:assert/strict";
import { test } from "node:test";
import { handleTextMessage } from "@handlers/handleTextMessage.js";

const createContext = (text: string) => {
	const replies: string[] = [];

	return {
		ctx: {
			message: { text },
			from: { id: 123 },
			reply: async (message: string) => {
				replies.push(message);
			},
		},
		replies,
	};
};

test("handleTextMessage rejects a single-letter message", async () => {
	const { ctx, replies } = createContext("a");

	await handleTextMessage(ctx as never);

	assert.equal(replies.length, 1);
	assert.ok(replies[0]?.includes("longer text message"));
});
