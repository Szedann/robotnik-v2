import { createCommand, option } from "@lib/command";
import { PermissionFlagsBits } from "discord.js";

export const Command = createCommand("ping", {
  description: "",
  defaultMemberPermissions: PermissionFlagsBits.SendMessages,
  options: {
    name: option.string({
      description: "The word to reply",
      choices: [{ name: "test", value: "test" }],
    }),
    file: option.attachment({
      description: "the file to attach",
      required: true,
    }),
    member: option.mentionable({
      description: "the person to ping",
    }),
  },
  component({ interaction, options }) {
    return (
      <message v2>
        <text>{options.name}</text>
      </message>
    );
  },
});
