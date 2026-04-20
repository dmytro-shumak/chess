import type { Chess } from "chess.js";
import { type Dispatch, type SetStateAction, useEffect } from "react";
import { GameStatus } from "../constants/chess/gameStatus";
import { gameStatusFromChess } from "../utils/chess/gameStatusFromChess";

export function useGameStatusFromChess(
  chess: Chess,
  setGameStatus: Dispatch<SetStateAction<GameStatus>>,
  options: { preserveTimeouts: boolean },
): void {
  const { preserveTimeouts } = options;

  useEffect(() => {
    if (preserveTimeouts) {
      setGameStatus((prev) => {
        if (prev === GameStatus.TIMEOUT_WHITE || prev === GameStatus.TIMEOUT_BLACK) {
          return prev;
        }

        return gameStatusFromChess(chess);
      });
    }

    setGameStatus(gameStatusFromChess(chess));
  }, [chess, preserveTimeouts, setGameStatus]);
}
