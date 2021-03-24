export type TalcShellNode = {
  name: string;
  doc: string;
  shell: string;
};

export type TalcCommandNode = {
  name: string;
  doc: string;
  commands: TalcNode[];
};

export type TalcNode = TalcShellNode | TalcCommandNode;
