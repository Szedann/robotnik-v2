import commandHandler from "@lib/commandHandler";
import { Client } from "discord.js";

export const client = new Client({
  intents: [],
});

client.login(Bun.env["DISCORD_TOKEN"]);
client.on("clientReady", (client) => {
  console.log(`authenticated as ${client.user.tag}`);
});

commandHandler(client);
