export type TalcLeafNode = {
  name: string;
  doc: string;
  shell: string;
};

export type TalcBranchNode = {
  name: string;
  doc: string;
  commands: TalcNode[];
};

export type TalcNode = TalcLeafNode | TalcBranchNode;
