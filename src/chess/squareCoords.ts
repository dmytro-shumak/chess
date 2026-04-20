import type { Square } from "chess.js";

export function squareFileAndRank(square: Square): { fileIndex: number; rankNumber: number } {
  const fileIndex = square.charCodeAt(0) - 97;
  const rankNumber = parseInt(square[1]!, 10);
  return { fileIndex, rankNumber };
}
