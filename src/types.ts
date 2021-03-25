export type TalcShellNode = {
  name: string;
  doc: string;
  shell: string;
};

export type TalcInternalJSFunctionNode = {
  name: string;
  doc: string;
  jsFunction: () => void;
};

export type TalcLeafNode = TalcShellNode | TalcInternalJSFunctionNode;

export type TalcBranchNode = {
  name: string;
  doc: string;
  commands: TalcNode[];
};

export type TalcNode = TalcLeafNode | TalcBranchNode;
