import yaml from "js-yaml";
import fs from "fs";
import childProcess from "child_process";
import { exit } from "process";
import validate from "./validate.js";
import { quote } from "shell-quote";

import { TalcNode } from "./types.js";
import {
  isLeafNode,
  helpString,
  commandListString,
  isShellNode,
} from "./helpers.js";
import chalk from "chalk";

type NodeSearchResult = {
  node: TalcNode;
  rest: string[];
  path: string[];
};

// This is the distillation of all things gross
function findNode(baseNode: TalcNode, inArgs: string[]): NodeSearchResult {
  const args = inArgs.slice();

  let node = baseNode;
  let idx = 0;

  while (!isLeafNode(node)) {
    const curCommand = args[idx];
    idx++;

    if (!curCommand) {
      break;
    }
    const next = node.commands.find((cmd) => cmd.name === curCommand);
    if (!next) {
      // There's probably some reorg of this that makes this pretty but i'm not
      // gonna spend much time trying to find it.
      idx--;
      break;
    }
    node = next;
  }

  return {
    node,
    path: args.slice(0, idx),
    rest: args.slice(idx),
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

  // This is the worst thing ever
  const tackOnFirst = (path: string[]) => [topLevelNode["name"]].concat(path);

  // Handle metacommands
  const talcBuiltins: TalcNode[] = [
    {
      name: "help",
      doc: "Output help information about various commands",
      builtin: true,
      jsFunction: function help() {
        const { node, path } = findNode(topLevelNode, args.slice(1));
        console.log(helpString(node, tackOnFirst(path)));
      },
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

  const { node: curNode, rest, path } = findNode(topLevelNode, args);
  if (!isLeafNode(curNode)) {
    if (rest.length) {
      const errMsg = chalk.red(
        `${tackOnFirst(path).join(" ")}: Invalid subcommand ${rest[0]}`
      );
      console.error(errMsg);
      console.log(commandListString(curNode));
      exit(1);
    } else {
      console.log(helpString(curNode, tackOnFirst(path)));
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
