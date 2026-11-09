export type Manager = {
  state: "start" | "first" | "item" | "separator" | "done";
  depth: number;
  inString: boolean;
  escaped: boolean;
  objectText: string;
};
