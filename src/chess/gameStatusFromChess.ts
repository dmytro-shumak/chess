import type { Chess } from "chess.js";
import { WHITE } from "chess.js";
import { GameStatus } from "../models/GameStatus";

/**
 * Maps a terminal (or ongoing) `Chess` position to `GameStatus`.
 *
 * Order matters: after checkmate and stalemate we classify specific draws
 * (`isInsufficientMaterial`, `isThreefoldRepetition`, `isDrawByFiftyMoves`) before the generic
 * `isDraw()` branch. Remaining draws fall through to `STALEMATE` because this app has no
 * separate `GameStatus` for e.g. dead position / agreement — align with product copy if you add one.
 */
export function gameStatusFromChess(chess: Chess): GameStatus {
  if (!chess.isGameOver()) return GameStatus.ACTIVE;
  if (chess.isCheckmate()) {
    return chess.turn() === WHITE ? GameStatus.CHECKMATE_WHITE : GameStatus.CHECKMATE_BLACK;
  }
  if (chess.isStalemate()) return GameStatus.STALEMATE;
  if (chess.isInsufficientMaterial()) return GameStatus.INSUFFICIENT_MATERIAL;
  if (chess.isThreefoldRepetition()) return GameStatus.THREEFOLD_REPETITION;
  if (chess.isDrawByFiftyMoves()) return GameStatus.FIFTY_MOVE_DRAW;
  if (chess.isDraw()) return GameStatus.STALEMATE;
  return GameStatus.ACTIVE;
}
