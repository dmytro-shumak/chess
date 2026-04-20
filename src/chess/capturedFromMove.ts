import type { Move } from "chess.js";
import { BLACK, PAWN, WHITE } from "chess.js";
import type { SvgComponent } from "../types/svg";
import { pieceLogo } from "./pieceGlyphs";

export type CapturedDisplay = { key: string; Logo: SvgComponent; label: string };

let capId = 0;

export function resetCapturedDisplayKeyCounter(): void {
  capId = 0;
}

/** Mover is `move.color`; captured piece is opponent's (for display on capturer's bar). */
export function capturedDisplayFromMove(move: Move): CapturedDisplay | null {
  if (!move.isCapture() && !move.isEnPassant()) return null;
  const mover = move.color;
  const capColor = mover === WHITE ? BLACK : WHITE;
  const capType = move.isEnPassant() ? PAWN : move.captured!;
  const Logo = pieceLogo(capType, capColor);
  const label = `${capColor === WHITE ? "W" : "B"} ${capType.toUpperCase()}`;
  return { key: `c${++capId}`, Logo, label };
}
