import { Player } from "../models/Player";
import { useState, useRef, useEffect, type ReactNode } from "react";
import { Colors } from "../models/Colors";
import { GameStatus } from "../models/GameStatus";
import PlayerBar from "./PlayerBar";

interface TimerProps {
  children: ReactNode;
  currentPlayer: Player | null;
  whitePlayer: Player;
  blackPlayer: Player;
  restart: () => void;
  startGame: () => void;
  gameStatus: GameStatus;
  capturedByWhite: import("../models/figures/Figure").Figure[];
  capturedByBlack: import("../models/figures/Figure").Figure[];
}

const INITIAL_TIME = 300; // 5 minutes in seconds

function Timer({
  children,
  currentPlayer,
  whitePlayer,
  blackPlayer,
  restart,
  startGame,
  gameStatus,
  capturedByWhite,
  capturedByBlack,
}: TimerProps) {
  const [blackTime, setBlackTime] = useState(INITIAL_TIME);
  const [whiteTime, setWhiteTime] = useState(INITIAL_TIME);
  const timer = useRef<null | ReturnType<typeof setInterval>>(null);

  useEffect(() => {
    if (gameStatus !== GameStatus.ACTIVE) {
      if (timer.current) {
        clearInterval(timer.current);
        timer.current = null;
      }
      return;
    }

    if (timer.current) {
      clearInterval(timer.current);
    }
    const callback =
      currentPlayer?.color === Colors.WHITE ? decrementWhiteTimer : decrementBlackTimer;
    timer.current = setInterval(callback, 1000);

    return () => {
      if (timer.current) {
        clearInterval(timer.current);
        timer.current = null;
      }
    };
  }, [currentPlayer, gameStatus]);

  function decrementBlackTimer() {
    setBlackTime((prev) => prev - 1);
  }

  function decrementWhiteTimer() {
    setWhiteTime((prev) => prev - 1);
  }

  function handleRestart() {
    setWhiteTime(INITIAL_TIME);
    setBlackTime(INITIAL_TIME);
    restart();
  }

  function handleStart() {
    setWhiteTime(INITIAL_TIME);
    setBlackTime(INITIAL_TIME);
    startGame();
  }

  const blackActive =
    gameStatus === GameStatus.ACTIVE && currentPlayer?.color === Colors.BLACK;
  const whiteActive =
    gameStatus === GameStatus.ACTIVE && currentPlayer?.color === Colors.WHITE;

  return (
    <div className="flex w-full max-w-[640px] flex-col items-center gap-1">
      <PlayerBar
        player={blackPlayer}
        seconds={blackTime}
        active={blackActive}
        actionLabel={gameStatus === GameStatus.NOT_STARTED ? "Start" : "Restart"}
        onAction={gameStatus === GameStatus.NOT_STARTED ? handleStart : handleRestart}
        capturedFigures={capturedByBlack}
      />
      {children}
      <PlayerBar
        player={whitePlayer}
        seconds={whiteTime}
        active={whiteActive}
        actionLabel=""
        onAction={() => {}}
        capturedFigures={capturedByWhite}
      />
    </div>
  );
}

export default Timer;
