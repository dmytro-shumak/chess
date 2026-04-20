import type { Square } from "chess.js";
import { BOARD_FILES } from "../../constants/chess/boardFiles";

export function squareFileAndRank(square: Square): { fileIndex: number; rankNumber: number } {
  const fileIndex = (BOARD_FILES as string).indexOf(square.charAt(0));
  const rankNumber = Number.parseInt(square.charAt(1), 10);

  return { fileIndex, rankNumber };
}
