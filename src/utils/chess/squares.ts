import type { Square } from "chess.js";
import { BOARD_FILES } from "../../constants/chess/boardFiles";
import { Colors } from "../../constants/chess/colors";

const RANKS_HIGH_TO_LOW = [8, 7, 6, 5, 4, 3, 2, 1] as const;
const RANKS_LOW_TO_HIGH = [1, 2, 3, 4, 5, 6, 7, 8] as const;

export function squaresInDisplayOrder(viewFromColor: Colors): Square[] {
  const ranks = viewFromColor === Colors.WHITE ? RANKS_HIGH_TO_LOW : RANKS_LOW_TO_HIGH;
  const filesLeftToRight = BOARD_FILES.split("");
  if (viewFromColor === Colors.BLACK) filesLeftToRight.reverse();

  const squares: Square[] = [];
  for (const rank of ranks) {
    for (const file of filesLeftToRight) {
      squares.push(`${file}${rank}` as Square);
    }
  }
  return squares;
}
