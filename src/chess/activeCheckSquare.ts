import type { Chess, Square } from "chess.js";
import { GameStatus } from "../models/GameStatus";
import { kingSquareForColor } from "./kingSquare";

export function activeCheckSquare(chess: Chess, gameStatus: GameStatus): Square | null {
  if (gameStatus !== GameStatus.ACTIVE || !chess.inCheck()) return null;
  return kingSquareForColor(chess, chess.turn());
}
