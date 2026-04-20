import type { Move } from "chess.js";
import { BLACK, PAWN, WHITE } from "chess.js";
import type { CapturedDisplay } from "../../types/chess/capturedDisplay";
import { pieceLogo } from "./pieceGlyphs";

// displayKey: unique React key per capture row (e.g. ply).
export function capturedDisplayFromMove(move: Move, displayKey: string): CapturedDisplay | null {
  const takesMaterial = move.isCapture() || move.isEnPassant();
  if (!takesMaterial) return null;

  const capturedPieceColor = move.color === WHITE ? BLACK : WHITE;
  const capturedPieceType = move.isEnPassant() ? PAWN : move.captured;
  if (!capturedPieceType) return null;

  const colorTag = capturedPieceColor === WHITE ? "W" : "B";
  const label = `${colorTag} ${capturedPieceType.toUpperCase()}`;

  return {
    key: displayKey,
    Logo: pieceLogo(capturedPieceType, capturedPieceColor),
    label,
  };
}
