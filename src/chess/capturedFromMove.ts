import type { Move } from "chess.js";
import { BLACK, PAWN, WHITE } from "chess.js";
import type { SvgComponent } from "../types/svg";
import { pieceLogo } from "./pieceGlyphs";

export type CapturedDisplay = { key: string; Logo: SvgComponent; label: string };

/** `displayKey` must be unique per capture row (e.g. ply index) for stable React keys. */
export function capturedDisplayFromMove(move: Move, displayKey: string): CapturedDisplay | null {
  if (!move.isCapture() && !move.isEnPassant()) return null;
  const mover = move.color;
  const capColor = mover === WHITE ? BLACK : WHITE;
  const capType = move.isEnPassant() ? PAWN : move.captured!;
  const Logo = pieceLogo(capType, capColor);
  const label = `${capColor === WHITE ? "W" : "B"} ${capType.toUpperCase()}`;
  return { key: displayKey, Logo, label };
}
