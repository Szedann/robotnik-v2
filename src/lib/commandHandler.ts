import { Command } from "./command";
import { parseFileObjects } from "./util";

export async function loadCommands() {
  const commands = await parseFileObjects(__dirname+"/../commands/", Command);

  console.log(commands);
}
