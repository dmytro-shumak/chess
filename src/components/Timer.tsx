import { Player } from "../models/Player";
import { useState, useRef, useEffect, type ReactNode } from "react";
import { Colors } from "../models/Colors";
import { GameStatus } from "../models/GameStatus";
import PlayerBar from "./PlayerBar";
import GameSidePanel from "./GameSidePanel";

interface TimerProps {
  children: ReactNode;
  currentPlayer: Player | null;
  whitePlayer: Player;
  blackPlayer: Player;
  restart: () => void;
  clocksStarted: boolean;
  gameStatus: GameStatus;
  capturedByWhite: import("../models/figures/Figure").Figure[];
  capturedByBlack: import("../models/figures/Figure").Figure[];
  onOutOfTime: (loser: Colors) => void;
  movePlies: string[];
  /** When false, no clocks or timeout logic (e.g. vs computer). */
  clocked?: boolean;
  sidePanelFooter?: ReactNode;
}

const INITIAL_TIME = 300; // 5 minutes in seconds

function Timer({
  children,
  currentPlayer,
  whitePlayer,
  blackPlayer,
  restart,
  clocksStarted,
  gameStatus,
  capturedByWhite,
  capturedByBlack,
  onOutOfTime,
  movePlies,
  clocked = true,
  sidePanelFooter,
}: TimerProps) {
  const [blackTime, setBlackTime] = useState(INITIAL_TIME);
  const [whiteTime, setWhiteTime] = useState(INITIAL_TIME);
  const timer = useRef<null | ReturnType<typeof setInterval>>(null);

  useEffect(() => {
    if (!clocked || gameStatus !== GameStatus.ACTIVE || !clocksStarted) return;

    if (currentPlayer?.color === Colors.WHITE && whiteTime <= 0) {
      onOutOfTime(Colors.WHITE);
      return
    } 

     if (currentPlayer?.color === Colors.BLACK && blackTime <= 0) {
      onOutOfTime(Colors.BLACK);
    }
  }, [clocked, whiteTime, blackTime, gameStatus, clocksStarted, currentPlayer, onOutOfTime]);

  useEffect(() => {
    if (!clocked || gameStatus !== GameStatus.ACTIVE || !clocksStarted) {
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
  }, [clocked, currentPlayer, gameStatus, clocksStarted]);

  function decrementBlackTimer() {
    setBlackTime((prev) => (prev <= 0 ? 0 : prev - 1));
  }

  function decrementWhiteTimer() {
    setWhiteTime((prev) => (prev <= 0 ? 0 : prev - 1));
  }

  function handleRestart() {
    if (clocked) {
      setWhiteTime(INITIAL_TIME);
      setBlackTime(INITIAL_TIME);
    }
    restart();
  }

  const blackActive =
    gameStatus === GameStatus.ACTIVE && currentPlayer?.color === Colors.BLACK;
  const whiteActive =
    gameStatus === GameStatus.ACTIVE && currentPlayer?.color === Colors.WHITE;

  return (
    <div className="flex w-full max-w-7xl flex-col items-stretch gap-8 lg:flex-row lg:items-start lg:justify-center">
      <div className="flex w-full max-w-[640px] flex-col items-center gap-1">
        <PlayerBar
          player={blackPlayer}
          seconds={clocked ? blackTime : undefined}
          active={blackActive}
          capturedFigures={capturedByBlack}
        />
        {children}
        <PlayerBar
          player={whitePlayer}
          seconds={clocked ? whiteTime : undefined}
          active={whiteActive}
          capturedFigures={capturedByWhite}
        />
      </div>
      <GameSidePanel
        restartDisabled={clocked && !clocksStarted && gameStatus === GameStatus.ACTIVE}
        onRestart={handleRestart}
        movePlies={movePlies}
        footer={sidePanelFooter}
      />
    </div>
  );
}

export default Timer;
