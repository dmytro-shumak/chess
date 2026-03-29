import { GameStatus } from "../models/GameStatus";

export function getGameOverMessage(status: GameStatus): string | null {
  switch (status) {
    case GameStatus.CHECKMATE_WHITE:
      return "Checkmate! White side lost.";
    case GameStatus.CHECKMATE_BLACK:
      return "Checkmate! Black side lost.";
    case GameStatus.STALEMATE:
      return "Stalemate! Draw.";
    default:
      return null;
  }
}
