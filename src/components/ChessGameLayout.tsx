import { type ReactNode, useEffect, useRef, useState } from "react";
import { Colors } from "../constants/chess/colors";
import { GameStatus } from "../constants/chess/gameStatus";
import type { CapturedDisplay } from "../types/chess/capturedDisplay";
import type { Player } from "../types/chess/player";
import GameSidePanel from "./GameSidePanel";
import PlayerBar from "./PlayerBar";

interface ChessGameLayoutProps {
  children: ReactNode;
  currentPlayer: Player | null;
  whitePlayer: Player;
  blackPlayer: Player;
  restart: () => void;
  clocksStarted: boolean;
  gameStatus: GameStatus;
  capturedByWhite: CapturedDisplay[];
  capturedByBlack: CapturedDisplay[];
  onOutOfTime?: (loser: Colors) => void;
  movePlies: string[];
  // false = no clock / timeout (e.g. vs computer).
  clocked?: boolean;
  // Put black bar at bottom
  invertPlayerBars?: boolean;
  initialClockSeconds?: number;
  // Disable restart
  lockRestart?: boolean;
  sidePanelFooter?: ReactNode;
  navColumn?: ReactNode;
}

const INITIAL_TIME = 300; // 5 minutes in seconds

function ChessGameLayout({
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
  navColumn,
}: ChessGameLayoutProps) {
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
      onOutOfTime?.(Colors.WHITE);
      return;
    }

    if (currentPlayer?.color === Colors.BLACK && blackTime <= 0) {
      onOutOfTime?.(Colors.BLACK);
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
    timer.current = setInterval(() => {
      if (currentPlayer?.color === Colors.WHITE) {
        setWhiteTime((prev) => (prev <= 0 ? 0 : prev - 1));
      } else {
        setBlackTime((prev) => (prev <= 0 ? 0 : prev - 1));
      }
    }, 1000);

    return () => {
      if (timer.current) {
        clearInterval(timer.current);
        timer.current = null;
      }
    };
  }, [clocked, currentPlayer, gameStatus, clocksStarted]);

  function handleRestart() {
    if (clocked) {
      setWhiteTime(startSeconds);
      setBlackTime(startSeconds);
    }
    restart();
  }

  const blackActive = gameStatus === GameStatus.ACTIVE && currentPlayer?.color === Colors.BLACK;
  const whiteActive = gameStatus === GameStatus.ACTIVE && currentPlayer?.color === Colors.WHITE;

  const topPlayer = invertPlayerBars ? whitePlayer : blackPlayer;
  const bottomPlayer = invertPlayerBars ? blackPlayer : whitePlayer;

  const topSeconds = invertPlayerBars ? whiteTime : blackTime;
  const bottomSeconds = invertPlayerBars ? blackTime : whiteTime;

  const topActive = invertPlayerBars ? whiteActive : blackActive;
  const bottomActive = invertPlayerBars ? blackActive : whiteActive;

  const topCaptured = invertPlayerBars ? capturedByWhite : capturedByBlack;
  const bottomCaptured = invertPlayerBars ? capturedByBlack : capturedByWhite;

  const restartDisabled =
    lockRestart || (clocked && !clocksStarted && gameStatus === GameStatus.ACTIVE);

  return (
    <div className="flex w-full max-w-7xl flex-row items-start justify-center gap-8">
      {navColumn !== undefined && navColumn !== null ? (
        <div className="flex max-w-48 shrink-0 flex-col items-start gap-2 self-start">
          {navColumn}
        </div>
      ) : null}
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
        restartDisabled={restartDisabled}
        onRestart={handleRestart}
        movePlies={movePlies}
        footer={sidePanelFooter}
      />
    </div>
  );
}

export default ChessGameLayout;
