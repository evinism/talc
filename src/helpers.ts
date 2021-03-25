import { TalcNode, TalcLeafNode, TalcBranchNode } from "./types";

export function isLeafNode(node: TalcNode): node is TalcLeafNode {
  return typeof (node as any).shell === "string";
}

export function helpString(node: TalcNode) {
  let helpString = `${node.name}: ${node.doc || "[no description]"}\n`;
  if (isLeafNode(node)) {
    helpString += shellHelpString(node);
  } else {
    helpString += commandListString(node);
  }
  return helpString;
}

export function shellHelpString(node: TalcLeafNode) {
  return `Aliased as:\n${node.shell}`;
}

export function commandListString(node: TalcBranchNode) {
  return (
    "\nAvailable commands are:\n" +
    Object.values(node.commands)
      .map((value) => ` * ${value.name}: ${value.doc}`)
      .join("\n")
  );
}
