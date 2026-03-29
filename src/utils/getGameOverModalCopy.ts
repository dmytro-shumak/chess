import { GameStatus } from "../models/GameStatus";

export type GameOverModalCopy = {
  winnerLabel: string | null;
  resultLine: string;
  detailLine: string | null;
};

export function getGameOverModalCopy(status: GameStatus): GameOverModalCopy | null {
  switch (status) {
    case GameStatus.CHECKMATE_WHITE:
      return {
        winnerLabel: "Black",
        resultLine: "Black wins by checkmate.",
        detailLine: "White’s king cannot escape attack.",
      };
    case GameStatus.CHECKMATE_BLACK:
      return {
        winnerLabel: "White",
        resultLine: "White wins by checkmate.",
        detailLine: "Black’s king cannot escape attack.",
      };
    case GameStatus.STALEMATE:
      return {
        winnerLabel: null,
        resultLine: "Draw — stalemate.",
        detailLine:
          "The side to move has no legal moves, and the king is not in check.",
      };
    default:
      return null;
  }
}
