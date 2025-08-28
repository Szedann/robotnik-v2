import { createChatInputCommand, option } from "@lib/command";
import { PermissionFlagsBits } from "discord.js";

export const Command = createChatInputCommand("ping", {
  description: "Ping!",
  options: {
    name: option.string({
      description: "The word to reply",
      required: true,
    }),
  },
  component({ interaction, options }) {
    return (
      <message v2>
        <container>
          <text># {options.name}</text>
        </container>
      </message>
    );
  },
});
