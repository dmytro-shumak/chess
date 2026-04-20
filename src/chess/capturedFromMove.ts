import type { Move } from "chess.js";
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
  const capColor = mover === "w" ? "b" : "w";
  const capType = move.isEnPassant() ? "p" : move.captured!;
  const Logo = pieceLogo(capType, capColor);
  const label = `${capColor === "w" ? "W" : "B"} ${capType.toUpperCase()}`;
  return { key: `c${++capId}`, Logo, label };
}
