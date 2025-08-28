import {
  Client,
  REST,
  Routes,
  type RESTGetAPIOAuth2CurrentApplicationResult,
} from "discord.js";
import { Command, parseOptions } from "./command";
import { parseFileObjects } from "./utils";
import { client } from "@index";
import { DJSXRenderer, DJSXRendererManager } from "discord-jsx-renderer";

async function loadCommands() {
  const commands = await parseFileObjects(__dirname + "/../commands/", Command);
  const commandMap = new Map(
    commands.values().map((command) => [command.name, command])
  );
  return commandMap;
}

async function reloadGlobalSlashCommands(
  rest: REST,
  commands: Map<string, Command<Record<string, any>>>
) {
  try {
    const { id: appId } = (await rest.get(
      Routes.oauth2CurrentApplication()
    )) as RESTGetAPIOAuth2CurrentApplicationResult;

    await rest.put(Routes.applicationCommands(appId), {
      body: commands.values().map((command) => command["generate"]()),
    });
  } catch (error) {
    console.error(error);
  }
}

async function reloadGuildSlashCommands(
  rest: REST,
  guildId: string,
  commands: Map<string, Command<Record<string, any>>>
) {
  try {
    const { id: appId } = (await rest.get(
      Routes.oauth2CurrentApplication()
    )) as RESTGetAPIOAuth2CurrentApplicationResult;
    console.log(`reloading guild slash commands for guild ${guildId}`);

    const body = commands
      .values()
      .map((command) => command["generate"]())
      .toArray();

    await rest.put(Routes.applicationGuildCommands(appId, guildId), {
      body,
    });
  } catch (error) {
    console.error(error);
  }
}

// main logic

export default async function (client: Client) {
  const commands = await loadCommands();

  const rest = new REST({ version: "10" }).setToken(client.token!);

  if (Bun.env["GUILD_ID"])
    await reloadGuildSlashCommands(rest, Bun.env["GUILD_ID"], commands);
  else await reloadGlobalSlashCommands(rest, commands);

  const djsx = new DJSXRendererManager();

  client.on("interactionCreate", (interaction) => {
    console.log("interaction");
    if (!interaction.isCommand()) return;
    if (!interaction.isChatInputCommand()) return;
    console.log(interaction.commandName);
    const command = commands.get(interaction.commandName);
    if (!command) return;

    const options = parseOptions(command, interaction);

    djsx.create(interaction, command.component({ interaction, options }));
  });
}
