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
        detailLine: "The side to move has no legal moves, and the king is not in check.",
      };
    case GameStatus.THREEFOLD_REPETITION:
      return {
        winnerLabel: null,
        resultLine: "Draw — threefold repetition.",
        detailLine: "The same position occurred three times.",
      };
    case GameStatus.FIFTY_MOVE_DRAW:
      return {
        winnerLabel: null,
        resultLine: "Draw — 50-move rule.",
        detailLine: "100 half-moves without a pawn move or capture.",
      };
    case GameStatus.TIMEOUT_WHITE:
      return {
        winnerLabel: "Black",
        resultLine: "Black wins on time.",
        detailLine: "White’s clock reached zero.",
      };
    case GameStatus.TIMEOUT_BLACK:
      return {
        winnerLabel: "White",
        resultLine: "White wins on time.",
        detailLine: "Black’s clock reached zero.",
      };
    case GameStatus.INSUFFICIENT_MATERIAL:
      return {
        winnerLabel: null,
        resultLine: "Draw — insufficient material.",
        detailLine: "Checkmate is not possible for either side.",
      };
    default:
      return null;
  }
}
