import { Player } from "../models/Player";
import { useState, useRef, useEffect, type ReactNode } from "react";
import { Colors } from "../models/Colors";
import { GameStatus } from "../models/GameStatus";
import type { CapturedDisplay } from "../chess/capturedFromMove";
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
  capturedByWhite: CapturedDisplay[];
  capturedByBlack: CapturedDisplay[];
  onOutOfTime: (loser: Colors) => void;
  movePlies: string[];
  /** When false, no clocks or timeout logic (e.g. vs computer). */
  clocked?: boolean;
  /** Swap vertical order so the black player bar is at the bottom (online black perspective). */
  invertPlayerBars?: boolean;
  /** Override default 5+5 minutes (e.g. online room time control). */
  initialClockSeconds?: number;
  /** When true, the restart control stays disabled (e.g. online mock cannot reset shared storage). */
  lockRestart?: boolean;
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
  invertPlayerBars = false,
  initialClockSeconds,
  lockRestart = false,
  sidePanelFooter,
}: TimerProps) {
  const startSeconds = initialClockSeconds ?? INITIAL_TIME;
  const [blackTime, setBlackTime] = useState(startSeconds);
  const [whiteTime, setWhiteTime] = useState(startSeconds);
  const timer = useRef<null | ReturnType<typeof setInterval>>(null);

  useEffect(() => {
    setBlackTime(startSeconds);
    setWhiteTime(startSeconds);
  }, [startSeconds]);

  useEffect(() => {
    if (!clocked || gameStatus !== GameStatus.ACTIVE || !clocksStarted) return;

    if (currentPlayer?.color === Colors.WHITE && whiteTime <= 0) {
      onOutOfTime(Colors.WHITE);
      return;
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
      setWhiteTime(startSeconds);
      setBlackTime(startSeconds);
    }
    restart();
  }

  const blackActive =
    gameStatus === GameStatus.ACTIVE && currentPlayer?.color === Colors.BLACK;
  const whiteActive =
    gameStatus === GameStatus.ACTIVE && currentPlayer?.color === Colors.WHITE;

  const topPlayer = invertPlayerBars ? whitePlayer : blackPlayer;
  const bottomPlayer = invertPlayerBars ? blackPlayer : whitePlayer;
  const topSeconds = invertPlayerBars ? whiteTime : blackTime;
  const bottomSeconds = invertPlayerBars ? blackTime : whiteTime;
  const topActive = invertPlayerBars ? whiteActive : blackActive;
  const bottomActive = invertPlayerBars ? blackActive : whiteActive;
  const topCaptured = invertPlayerBars ? capturedByWhite : capturedByBlack;
  const bottomCaptured = invertPlayerBars ? capturedByBlack : capturedByWhite;

  return (
    <div className="flex w-full max-w-7xl flex-col items-stretch gap-8 lg:flex-row lg:items-start lg:justify-center">
      <div className="flex w-full max-w-[640px] flex-col items-center gap-1">
        <PlayerBar
          player={topPlayer}
          seconds={clocked ? topSeconds : undefined}
          active={topActive}
          capturedFigures={topCaptured}
        />
        {children}
        <PlayerBar
          player={bottomPlayer}
          seconds={clocked ? bottomSeconds : undefined}
          active={bottomActive}
          capturedFigures={bottomCaptured}
        />
      </div>
      <GameSidePanel
        restartDisabled={
          lockRestart || (clocked && !clocksStarted && gameStatus === GameStatus.ACTIVE)
        }
        onRestart={handleRestart}
        movePlies={movePlies}
        footer={sidePanelFooter}
      />
    </div>
  );
}

export default Timer;
