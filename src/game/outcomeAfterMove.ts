import { Board, FIFTY_MOVE_HALF_MOVE_LIMIT } from "../models/Board";
import { Colors } from "../models/Colors";
import { GameStatus } from "../models/GameStatus";
import { buildRepetitionKey } from "../utils/positionRepetition";
import { isInsufficientMaterial } from "../utils/insufficientMaterial";

/**
 * Registers the position for the side to move and returns the game status
 * after the opponent has just moved (so `sideToMoveNext` is the player on the clock).
 */
export function outcomeAfterMove(
  board: Board,
  sideToMoveNext: Colors,
  repetitionCounts: Map<string, number>,
): GameStatus {
  const key = buildRepetitionKey(board, sideToMoveNext);
  const nextCount = (repetitionCounts.get(key) ?? 0) + 1;
  repetitionCounts.set(key, nextCount);

  if (board.isCheckmate(sideToMoveNext)) {
    return sideToMoveNext === Colors.WHITE ? GameStatus.CHECKMATE_WHITE : GameStatus.CHECKMATE_BLACK;
  }
  if (board.isStalemate(sideToMoveNext)) {
    return GameStatus.STALEMATE;
  }
  if (isInsufficientMaterial(board)) {
    return GameStatus.INSUFFICIENT_MATERIAL;
  }
  if (board.halfMoveClock >= FIFTY_MOVE_HALF_MOVE_LIMIT) {
    return GameStatus.FIFTY_MOVE_DRAW;
  }
  if (nextCount >= 3) {
    return GameStatus.THREEFOLD_REPETITION;
  }
  return GameStatus.ACTIVE;
}
