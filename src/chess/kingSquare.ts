import type { Chess, Color, Square } from "chess.js";
import { KING } from "chess.js";

export function kingSquareForColor(chess: Chess, color: Color): Square | null {
  const rows = chess.board();
  for (let r = 0; r < 8; r++) {
    const row = rows[r]!;
    for (let f = 0; f < 8; f++) {
      const p = row[f];
      if (p && p.type === KING && p.color === color) {
        const file = String.fromCharCode(97 + f);
        const rank = 8 - r;
        return `${file}${rank}` as Square;
      }
    }
  }
  return null;
}
