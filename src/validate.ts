import { TalcNode } from "./types.js";

const boilerplate = "talc: Error in parsing talc config\n";

export default function validateTalcYaml(target: unknown): target is TalcNode {
  if (typeof target !== "object" || target === null) {
    console.error(`${boilerplate}Expected object as talc node`);
    return false;
  }
  const { name, doc, shell, commands } = target as { [key: string]: unknown };
  if (typeof name !== "string") {
    console.error(`${boilerplate}Missing property 'name' in Talc config`);
    return false;
  }
  // Warn instead of failing, but that's fine.
  if (typeof doc !== "string") {
    console.warn(`Warning: Missing docstring in talc config for name ${name}`);
  }

  if (shell && commands) {
    console.error(
      `${boilerplate}Both 'shell' and 'commands' are specified in a node`
    );
    return false;
  }
  if (shell) {
    return typeof shell === "string";
  }
  if (commands) {
    if (!Array.isArray(commands)) {
      console.error(
        `${boilerplate}Talc expects 'commands' to be an array of nodes`
      );
      return false;
    }
    return commands.every(validateTalcYaml);
  }
  console.error(
    `${boilerplate}Nodes in talc must have either 'shell' or 'commands' key.`
  );
  return false;
}
