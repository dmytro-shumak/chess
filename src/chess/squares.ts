import type { Square } from "chess.js";
import { Colors } from "../models/Colors";

/** Screen order: top row first; white at bottom = rank 8 at top; black at bottom = rank 1 at top, files h..a. */
export function squaresInDisplayOrder(viewFromColor: Colors): Square[] {
  const out: Square[] = [];
  if (viewFromColor === Colors.WHITE) {
    for (let rank = 8; rank >= 1; rank--) {
      for (let file = 0; file < 8; file++) {
        out.push(`${String.fromCharCode(97 + file)}${rank}` as Square);
      }
    }
  } else {
    for (let rank = 1; rank <= 8; rank++) {
      for (let file = 7; file >= 0; file--) {
        out.push(`${String.fromCharCode(97 + file)}${rank}` as Square);
      }
    }
  }
  return out;
}
