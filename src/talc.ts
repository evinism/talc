import yaml from "js-yaml";
import fs from "fs";
import childProcess from "child_process";
import { env, exit } from "process";
import validate from "./validate";

import { TalcNode, TalcCommandNode, TalcShellNode } from "./types";

function isShellNode(node: TalcNode): node is TalcShellNode {
  return typeof (node as any).shell === "string";
}

function helpString(node: TalcCommandNode) {
  return (
    "Available commands are:\n" +
    Object.values(node.commands)
      .map((value) => `  ${value.name}: ${value.doc}`)
      .join("\n")
  );
}

function talc(argv: string[]) {
  const workingDirectory = env["TALCDIR"] || process.cwd();

  let topLevelNode: any;
  try {
    topLevelNode = yaml.load(
      fs.readFileSync(`${workingDirectory}/talc.yaml`, "utf8")
    );
  } catch (e) {
    console.error(
      "talc: Could not open talc CLI spec talc.yaml\n" +
        "Are you in a directory with a talc CLI?"
    );
    exit(1);
  }

  if (!topLevelNode["name"]) {
    topLevelNode["name"] = "talc";
  }

  if (!validate(topLevelNode)) {
    exit(1);
  }

  let args = argv;
  if (args[0].endsWith("/node")) {
    args = args.slice(2);
  } else {
    args = args.slice(1);
  }

  // Handle metacommands
  const talcMeta: TalcNode = {
    name: "meta",
    doc: "Commands having to do with talc itself",
    commands: [
      {
        name: "alias",
        doc:
          "Output an alias that you can add to your aliases file to register a command",
        shell: `echo 'Add the following line to your aliases file:' && echo "alias $(pwd | xargs basename)=\\"TALCDIR=$(pwd) talc\\""`,
      },
    ],
  };
  if (args[0] === "meta") {
    args = args.slice(1);
    topLevelNode = talcMeta;
  }

  // Main search
  let curNode: TalcNode = topLevelNode;
  while (!isShellNode(curNode)) {
    const curCommand = args.shift();
    if (!curCommand) {
      console.log(helpString(curNode));
      exit(0);
    }

    const next = curNode.commands.find((cmd) => cmd.name === curCommand);
    if (!next) {
      const errMsg = `talc: Invalid subcommand ${curCommand}\n${helpString(
        curNode
      )}`;
      console.error(errMsg);
      exit(1);
    }
    curNode = next;
  }

  // Execution
  childProcess.execSync(curNode.shell + args.join(" "), {
    cwd: workingDirectory,
    stdio: "inherit",
  });
}

export default talc;
