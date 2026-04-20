import { type Dispatch, type SetStateAction, useEffect, useRef, useState } from "react";
import { GameStatus } from "../models/GameStatus";

export const DEFAULT_GAME_OVER_MODAL_DELAY_MS = 500;

export function useDelayedGameOverModal(
  gameStatus: GameStatus,
  delayMs: number = DEFAULT_GAME_OVER_MODAL_DELAY_MS,
): {
  gameOverModalReady: boolean;
  gameOverDismissed: boolean;
  setGameOverDismissed: Dispatch<SetStateAction<boolean>>;
} {
  const [gameOverDismissed, setGameOverDismissed] = useState(false);
  const [gameOverModalReady, setGameOverModalReady] = useState(false);
  const gameOverModalDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (gameStatus === GameStatus.ACTIVE) {
      setGameOverDismissed(false);
    }
  }, [gameStatus]);

  useEffect(() => {
    if (gameOverModalDelayRef.current) {
      clearTimeout(gameOverModalDelayRef.current);
      gameOverModalDelayRef.current = null;
    }

    if (gameStatus === GameStatus.ACTIVE) {
      setGameOverModalReady(false);
      return;
    }

    setGameOverModalReady(false);
    gameOverModalDelayRef.current = setTimeout(() => {
      gameOverModalDelayRef.current = null;
      setGameOverModalReady(true);
    }, delayMs);

    return () => {
      if (gameOverModalDelayRef.current) {
        clearTimeout(gameOverModalDelayRef.current);
        gameOverModalDelayRef.current = null;
      }
    };
  }, [gameStatus, delayMs]);

  return { gameOverModalReady, gameOverDismissed, setGameOverDismissed };
}
