export interface Entry {
  id: string;
  rawInput: string;
  task: string;
  description: string;
  category: string;
  duration: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ParsedEntry {
  task: string;
  description: string;
  category: string;
  duration: number | null;
}

export interface Summary {
  id: string;
  type: "day" | "week" | "month" | "all";
  rangeStart: Date;
  rangeEnd: Date;
  content: string;
  generatedAt: Date;
}