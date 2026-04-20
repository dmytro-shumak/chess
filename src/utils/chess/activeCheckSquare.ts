import { type Chess, KING, type Square } from "chess.js";
import { GameStatus } from "../../constants/chess/gameStatus";

export function activeCheckSquare(chess: Chess, gameStatus: GameStatus): Square | null {
  if (gameStatus !== GameStatus.ACTIVE || !chess.inCheck()) return null;

  const color = chess.turn();
  const squares = chess.findPiece({ type: KING, color });
  return squares[0] ?? null;
}
