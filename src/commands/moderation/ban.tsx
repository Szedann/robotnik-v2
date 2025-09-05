import { createChatInputCommand, option } from "@lib/command";
import { Colors, inlineCode, PermissionsBitField, quote } from "discord.js";

export const Command = createChatInputCommand("ban", {
  description: "Bans a member",
  default_member_permissions: PermissionsBitField.Flags.BanMembers.toString(),
  options: {
    member: option.user({
      description: "The Member to ban",
      required: true,
    }),
    reason: option.string({
      description: "Ban reason",
    }),
  },
  async component({ interaction, options }) {
    const member = await interaction.guild?.members.fetch(options.member);
    if (!member) return <message>no member found</message>;
    member.ban({
      reason: options.reason ?? undefined,
    });
    return (
      <message v2>
        <container color={Colors.Red}>
          <section>
            <accessory>
              <thumbnail media={member.displayAvatarURL()} />
            </accessory>
            <text># Member banned</text>
            <text>Username: {inlineCode(member.user.username)}</text>
            <text>
              ban reason:{"\n"}
              {quote(options.reason ?? "no reason provided")}
            </text>
          </section>
        </container>
      </message>
    );
  },
});
