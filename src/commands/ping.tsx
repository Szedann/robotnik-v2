import { createChatInputCommand, option } from "@lib/command";

export const Command = createChatInputCommand("ping", {
  description: "Ping!",

  component({ interaction, options }) {
    return (
      <message v2>
        <container>
          <text># Pong</text>
        </container>
      </message>
    );
  },
});
