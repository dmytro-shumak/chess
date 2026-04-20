export type EnginePreset = {
  id: string;
  label: string;
  movetime: number;
  depth: number;
};

export const ENGINE_PRESETS: EnginePreset[] = [
  { id: "easy", label: "Easy", movetime: 50, depth: 2 },
  { id: "medium", label: "Medium", movetime: 350, depth: 8 },
  { id: "hard", label: "Hard", movetime: 900, depth: 14 },
];

export const DEFAULT_ENGINE_PRESET = ENGINE_PRESETS[1];
