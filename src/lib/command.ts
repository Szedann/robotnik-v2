import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  Attachment,
  ChatInputCommandInteraction,
  CommandInteraction,
  Role,
  User,
  type APIApplicationCommand,
  type APIApplicationCommandBasicOption,
  type APIApplicationCommandOptionBase,
  type Channel,
  type CommandInteractionOption,
  type RESTPostAPIChatInputApplicationCommandsJSONBody,
} from "discord.js";
import type React from "react";

const OptionKeys = {
  string: ApplicationCommandOptionType.String,
  integer: ApplicationCommandOptionType.Integer,
  boolean: ApplicationCommandOptionType.Boolean,
  user: ApplicationCommandOptionType.User,
  channel: ApplicationCommandOptionType.Channel,
  role: ApplicationCommandOptionType.Role,
  mentionable: ApplicationCommandOptionType.Mentionable,
  number: ApplicationCommandOptionType.Number,
  attachment: ApplicationCommandOptionType.Attachment,
} as const;

type KeyOptions = {
  [K in keyof typeof OptionKeys as (typeof OptionKeys)[K]]: K;
};

type OptionParameters<K extends keyof typeof OptionKeys> =
  APIApplicationCommandOptionBase<(typeof OptionKeys)[K]>;

interface OptionOutputs {
  boolean: boolean;
  user: User;
  channel: Channel;
  role: Role;
  attachment: Attachment;
  mentionable: NonNullable<
    CommandInteractionOption<"cached">["member" | "role" | "user"]
  >;
  string: string;
  integer: number;
  number: number;
}

type Option = Omit<APIApplicationCommandBasicOption, "name">;

type WithRequired<T, K extends keyof T> = T & {
  [P in K]-?: T[P];
};

type CommandOptionOutputs<O extends Record<string, Option>> = {
  [K in keyof O]: Optional<
    OptionOutputs[KeyOptions[O[K]["type"]]],
    Truthy<O[K]["required"]>
  >;
};

type Truthy<T> = T extends boolean ? T : false;

type Optional<T, Required extends boolean> = Required extends true
  ? T
  : T | null | undefined;

type CommandParams = Omit<
  WithRequired<Partial<APIApplicationCommand>, "description">,
  "name" | "options"
>;

export class Command<O extends Record<string, Option>> {
  constructor(
    public readonly name: string,
    public readonly options: O,
    public readonly params: CommandParams,
    public readonly component: (_: {
      interaction: CommandInteraction;
      options: CommandOptionOutputs<O>;
    }) => React.ReactNode
  ) {}
  // public name: string;
  private generate(): RESTPostAPIChatInputApplicationCommandsJSONBody {
    const options: APIApplicationCommandBasicOption[] = Object.entries(
      this.options
    ).map(([name, option]) => ({
      ...option,
      name,
    }));
    return {
      ...this.params,
      name: this.name,
      type: ApplicationCommandType.ChatInput,
      contexts: this.params.contexts ?? undefined,
      options,
    };
  }
}

export function createChatInputCommand<O extends Record<string, Option>>(
  name: string,
  settings: {
    options: O;
    component: (_: {
      interaction: CommandInteraction;
      options: CommandOptionOutputs<O>;
    }) => React.ReactNode;
  } & CommandParams
) {
  const { options, component, ...params } = settings;
  return new Command(name, options, params, component);
}

function addOption<
  T extends keyof OptionOutputs,
  O extends Omit<
    WithRequired<Partial<OptionParameters<T>>, "description">,
    "name"
  >,
>(type: T, option: O) {
  return { type: OptionKeys[type], ...option };
}

type AddOptionTypes = {
  [K in keyof OptionOutputs]: <
    O extends Omit<
      WithRequired<Partial<OptionParameters<K>>, "description">,
      "name"
    >,
  >(
    options: O
  ) => O & { type: (typeof OptionKeys)[K] };
};

//@ts-expect-error it's all in the getter
export const option: AddOptionTypes = new Proxy(
  {},
  {
    get<
      K extends keyof OptionOutputs,
      O extends Omit<
        WithRequired<Partial<OptionParameters<K>>, "description">,
        "name"
      >,
    >(_: {}, p: K) {
      return (a: O) => addOption(p, a);
    },
  }
);

export function parseOptions<O extends Record<string, Option>>(
  command: Command<O>,
  interaction: ChatInputCommandInteraction
): CommandOptionOutputs<O> {
  const options: Partial<CommandOptionOutputs<O>> = {};
  for (const key in command.options) {
    const data = interaction.options.get(key);
    if (!data) continue;
    //@ts-expect-error yeah
    options[key] =
      data.value ??
      data.user ??
      data.role ??
      data.message ??
      data.member ??
      data.channel ??
      data.attachment;
  }
  return options as CommandOptionOutputs<O>;
}
