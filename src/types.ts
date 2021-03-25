interface TalcBaseNode {
  name: string;
  doc: string;
  builtin?: boolean;
}

export interface TalcShellNode extends TalcBaseNode {
  shell: string;
}

export interface TalcInternalJSFunctionNode extends TalcBaseNode {
  builtin: true;
  jsFunction: () => void;
}

export interface TalcBranchNode extends TalcBaseNode {
  commands: TalcNode[];
}

export type TalcLeafNode = TalcShellNode | TalcInternalJSFunctionNode;

export type TalcNode = TalcLeafNode | TalcBranchNode;
