import yaml from "js-yaml";
import fs from "fs";
import childProcess from "child_process";
import { exit } from "process";
import validate from "./validate";

import { TalcNode, TalcCommandNode, TalcShellNode } from "./types";

function isShellNode(node: TalcNode): node is TalcShellNode {
  return typeof (node as any).shell === "string";
}

function helpString(node: TalcNode) {
  let helpString = `${node.name}: ${node.doc || "[no description]"}\n`;
  if (isShellNode(node)) {
    helpString += shellHelpString(node);
  } else {
    helpString += commandListString(node);
  }
  return helpString;
}

function shellHelpString(node: TalcShellNode) {
  return `Aliased as:\n${node.shell}`;
}

function commandListString(node: TalcCommandNode) {
  return (
    "\nAvailable commands are:\n" +
    Object.values(node.commands)
      .map((value) => ` * ${value.name}: ${value.doc}`)
      .join("\n")
  );
}

function talc(argv: string[], workingDirectory: string) {
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
  const talcBuiltins: TalcNode[] = [
    {
      name: "meta",
      doc: "Commands having to do with talc itself [builtin]",
      commands: [
        {
          name: "alias",
          doc:
            "Output an alias that you can add to your aliases file to register a command",
          shell: `echo 'Add the following line to your aliases file:' && echo "alias $(pwd | xargs basename)=\\"TALCDIR=$(pwd) talc\\""`,
        },
      ],
    },
  ];

  if (!isShellNode(topLevelNode)) {
    topLevelNode.commands.push(...talcBuiltins);
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
      const errMsg = `talc: Invalid subcommand ${curCommand}\n${commandListString(
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
