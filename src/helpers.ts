import {
  TalcNode,
  TalcShellNode,
  TalcInternalJSFunctionNode,
  TalcLeafNode,
  TalcBranchNode,
} from "./types";

import chalk from "chalk";

export function isInternalJSFunctionNode(
  node: TalcNode
): node is TalcInternalJSFunctionNode {
  return typeof (node as TalcInternalJSFunctionNode).jsFunction === "function";
}

export function isShellNode(node: TalcNode): node is TalcShellNode {
  return typeof (node as TalcShellNode).shell === "string";
}

export function isLeafNode(node: TalcNode): node is TalcLeafNode {
  return isShellNode(node) || isInternalJSFunctionNode(node);
}

export function helpString(node: TalcNode) {
  let helpString = `${chalk.blueBright(node.name)}: ${
    node.doc || "[no description]"
  }\n`;
  if (isShellNode(node)) {
    helpString += shellHelpString(node);
  } else if (isInternalJSFunctionNode(node)) {
    helpString += internalJSHelpString(node);
  } else {
    helpString += commandListString(node);
  }
  return helpString;
}

export function shellHelpString(node: TalcShellNode) {
  return `Aliased as:\n${node.shell}`;
}

export function internalJSHelpString(node: TalcInternalJSFunctionNode) {
  return `[builtin function ${node.name}]`;
}

export function commandListString(node: TalcBranchNode) {
  const toLine = (value: TalcNode) => {
    let retval = ` * ${chalk.blueBright(value.name)}: ${value.doc}`;
    if (value.builtin) {
      retval += " [builtin]";
      retval = chalk.dim(retval);
    }
    return retval;
  };
  return (
    "\nAvailable commands are:\n" +
    Object.values(node.commands).map(toLine).join("\n")
  );
}
