import yaml from "js-yaml";
import fs from "fs";
import childProcess from "child_process";
import { exit } from "process";
import validate from "./validate";
import { quote } from "shell-quote";

import { TalcNode } from "./types";
import {
  isLeafNode,
  helpString,
  commandListString,
  isShellNode,
} from "./helpers";
import chalk from "chalk";

type NodeSearchResult = {
  node: TalcNode;
  rest: string[];
};

// This is the distillation of all things gross
function findNode(baseNode: TalcNode, args: string[]): NodeSearchResult {
  const rest = args.slice();

  let node = baseNode;
  while (!isLeafNode(node)) {
    const curCommand = rest.shift();
    if (!curCommand) {
      return { node, rest };
    }
    const next = node.commands.find((cmd) => cmd.name === curCommand);
    if (!next) {
      // There's probably some reorg of this that makes this pretty but i'm not
      // gonna spend much time trying to find it.
      rest.unshift(curCommand);
      return { node, rest };
    }
    node = next;
  }

  return {
    node,
    rest,
  };
}

function talc(argv: string[], workingDirectory: string) {
  let args = argv;

  let topLevelNode: any;
  try {
    topLevelNode = yaml.load(
      fs.readFileSync(`${workingDirectory}/talc.yaml`, "utf8")
    );
  } catch (e) {
    console.error(
      chalk.red(
        "talc: Could not open talc CLI configuration file talc.yaml\n" +
          "Are you in a directory with a talc CLI?"
      )
    );
    exit(1);
  }

  if (!topLevelNode["name"]) {
    topLevelNode["name"] = "talc";
  }

  if (!validate(topLevelNode)) {
    exit(1);
  }

  if (args[0].endsWith("/node")) {
    args = args.slice(2);
  } else {
    args = args.slice(1);
  }

  // Handle metacommands
  const talcBuiltins: TalcNode[] = [
    {
      name: "help",
      doc: "Output help information about various commands",
      builtin: true,
      jsFunction: () =>
        console.log(helpString(findNode(topLevelNode, args.slice(1)).node)),
    },
    {
      name: "meta",
      doc: "Commands having to do with talc itself",
      builtin: true,
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

  if (!isLeafNode(topLevelNode)) {
    topLevelNode.commands.push(...talcBuiltins);
  }

  const { node: curNode, rest } = findNode(topLevelNode, args);
  if (!isLeafNode(curNode)) {
    if (rest.length) {
      const errMsg = chalk.red(`talc: Invalid subcommand ${rest[0]}`);
      console.error(errMsg);
      console.log(commandListString(curNode));
      exit(1);
    } else {
      console.log(helpString(curNode));
      exit(0);
    }
  }

  if (isShellNode(curNode)) {
    childProcess.execSync(curNode.shell + " " + quote(rest), {
      cwd: workingDirectory,
      stdio: "inherit",
    });
  } else {
    curNode.jsFunction();
  }
}

export default talc;
