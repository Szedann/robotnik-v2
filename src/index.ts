import { Client } from "discord.js";
import { loadCommands } from "./lib/commandHandler";

const client = new Client({
  intents: []
})

// client.login()

loadCommands()