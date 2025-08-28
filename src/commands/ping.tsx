import { createChatInputCommand, option } from "@lib/command";
import { PermissionFlagsBits } from "discord.js";

export const Command = createChatInputCommand("ping", {
  description: "Ping!",
  default_member_permissions: PermissionFlagsBits.SendMessages.toString(),
  options: {
    name: option.string({
      description: "The word to reply",
      choices: [{ name: "test", value: "test" }],
      required: true,
    }),
    member: option.mentionable({
      description: "the person to ping",
    }),
  },
  component({ interaction, options }) {
    console.log(interaction.user.tag);
    return (
      <message v2>
        <text>{options.name}</text>
      </message>
    );
  },
});
