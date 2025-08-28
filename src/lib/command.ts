import {
  Attachment,
  CommandInteraction,
  Role,
  SlashCommandAttachmentOption,
  SlashCommandBooleanOption,
  SlashCommandBuilder,
  SlashCommandChannelOption,
  SlashCommandIntegerOption,
  SlashCommandMentionableOption,
  SlashCommandRoleOption,
  SlashCommandStringOption,
  SlashCommandUserOption,
  User,
  type Channel,
  type CommandInteractionOption,
} from "discord.js";
import type React from "react";

const OptionInstances = {
  boolean: SlashCommandBooleanOption,
  user: SlashCommandUserOption,
  channel: SlashCommandChannelOption,
  role: SlashCommandRoleOption,
  attachment: SlashCommandAttachmentOption,
  mentionable: SlashCommandMentionableOption,
  string: SlashCommandStringOption,
  integer: SlashCommandIntegerOption,
  number: SlashCommandIntegerOption,
} as const;

interface OptionTypeOutputs {
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

interface Option {
  type: keyof OptionTypeOutputs;
  description: string;
  required?: boolean;
}

type WithRequired<T, K extends keyof T> = T & {
  [P in K]-?: T[P];
};

type CommandOptionOutputs<O extends Record<string, Option>> = {
  [K in keyof O]: Optional<
    OptionTypeOutputs[O[K]["type"]],
    Truthy<O[K]["required"]>
  >;
};

type Truthy<T> = T extends boolean ? T : false;

type Optional<T, Required extends boolean> = Required extends true
  ? T
  : T | null | undefined;

// type L = CommandOptionOutputs<{test: {description: "test", required: false, type: "string"}}>

export class Command<O extends Record<string, Option>> {
  constructor(
    public name: string,
    public options: O,
    public component: (_: {
      interaction: CommandInteraction;
      options: CommandOptionOutputs<O>;
    }) => React.ReactNode,
    public params: WithRequired<
      Partial<SettersToOptions<SlashCommandBuilder>>,
      "description"
    >
  ) {}
  // public name: string;
  private generate() {
    return new SlashCommandBuilder().setName(this.name);
  }
}

export function createCommand<O extends Record<string, Option>>(
  name: string,
  settings: {
    options: O;
    component: (_: {
      interaction: CommandInteraction;
      options: CommandOptionOutputs<O>;
    }) => React.ReactNode;
  } & WithRequired<
    Partial<SettersToOptions<SlashCommandBuilder>>,
    "description"
  >
): Command<O> {
  const { options, component, ...params } = settings;
  return new Command(name, options, component, params);
}

type SettersToOptions<T> = {
  [K in keyof T as K extends `set${infer P}`
    ? Uncapitalize<P>
    : never]: T[K] extends (..._: infer O) => {} ? ExtractIfSingle<O> : never;
};

type OptionOptions<T extends keyof typeof OptionInstances> = SettersToOptions<
  InstanceType<(typeof OptionInstances)[T]>
>;

type ExtractIfSingle<T extends Array<unknown>> = T extends [infer R] ? R : T;

function addOption<
  T extends keyof OptionTypeOutputs,
  O extends Omit<
    WithRequired<Partial<OptionOptions<T>>, "description">,
    "name"
  >,
>(type: T, option: O) {
  return { type, ...option };
}

type AddOptionTypes = {
  [K in keyof OptionTypeOutputs]: <
    O extends Omit<
      WithRequired<Partial<OptionOptions<K>>, "description">,
      "name"
    >,
  >(
    options: O
  ) => O & { type: K };
};

export const option: AddOptionTypes = new Proxy(
  {},
  {
    get(target, p, receiver) {
      return (a) => addOption(p, a);
    },
  }
);

// Object.keys(OptionInstances).map((v:keyof OptionTypeOutputs)=>)
option.string({ description: "test" });
