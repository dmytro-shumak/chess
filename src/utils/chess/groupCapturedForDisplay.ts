import type { CapturedDisplay, CapturedDisplayGroup } from "../../types/chess/capturedDisplay";

const PIECE_WORD: Record<string, string> = {
  P: "Pawn",
  N: "Knight",
  B: "Bishop",
  R: "Rook",
  Q: "Queen",
  K: "King",
};

export function groupCapturedForDisplay(figures: CapturedDisplay[]): CapturedDisplayGroup[] {
  const groupsByLabel = new Map<string, CapturedDisplayGroup>();

  for (const capture of figures) {
    let group = groupsByLabel.get(capture.label);
    if (!group) {
      group = { label: capture.label, Logo: capture.Logo, keys: [] };
      groupsByLabel.set(capture.label, group);
    }
    group.keys.push(capture.key);
  }

  return Array.from(groupsByLabel.values());
}

export function pieceWordFromCaptureLabel(label: string): string {
  const symbol = label.split(" ")[1]?.toUpperCase() ?? "";
  return PIECE_WORD[symbol] || "";
}
