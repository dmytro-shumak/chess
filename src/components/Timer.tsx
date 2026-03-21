import { Player } from "../models/Player";
import { useState, useRef, useEffect, type ReactNode } from "react";
import { Colors } from "../models/Colors";
import { GameStatus } from "../models/GameStatus";
import { classNames } from "../utils/classNames";

interface TimerProps {
  children: ReactNode;
  currentPlayer: Player | null;
  whitePlayer: Player;
  blackPlayer: Player;
  restart: () => void;
  gameStatus: GameStatus;
}

function formatMmSs(totalSeconds: number): string {
  const s = Math.max(0, totalSeconds);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

function Timer({
  children,
  currentPlayer,
  whitePlayer,
  blackPlayer,
  restart,
  gameStatus,
}: TimerProps) {
  const [blackTime, setBlackTime] = useState(300);
  const [whiteTime, setWhiteTime] = useState(300);
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
    setWhiteTime(300);
    setBlackTime(300);
    restart();
  }

  const bar = (opts: {
    player: Player;
    seconds: number;
    active: boolean;
    showRestart?: boolean;
  }) => (
    <div
      className={classNames(
        "flex w-[640px] max-w-full items-center justify-between gap-3 rounded-sm px-3 py-2.5 transition-colors",
        opts.active
          ? "border border-emerald-200 bg-emerald-50 text-chess-highlight ring-2 ring-chess-highlight/35"
          : "border border-slate-200 bg-slate-100 text-slate-600"
      )}
    >
      <div className="flex min-w-0 flex-1 items-center p-2">
        <span
          className={classNames(
            "truncate text-sm font-semibold sm:text-base",
            opts.active ? "text-chess-highlight" : "text-slate-600"
          )}
        >
          {opts.player.name}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span
          className={classNames(
            "rounded px-2.5 py-1 font-mono text-sm tabular-nums sm:text-base",
            opts.active
              ? "bg-white text-chess-highlight shadow-sm"
              : "bg-white/80 text-slate-700 shadow-sm"
          )}
        >
          {formatMmSs(opts.seconds)}
        </span>
        {opts.showRestart && (
          <button
            type="button"
            onClick={handleRestart}
            className="rounded px-2 py-1 text-xs font-medium text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline"
          >
            Restart
          </button>
        )}
      </div>
    </div>
  );

  const blackActive =
    gameStatus === GameStatus.ACTIVE && currentPlayer?.color === Colors.BLACK;
  const whiteActive =
    gameStatus === GameStatus.ACTIVE && currentPlayer?.color === Colors.WHITE;

  return (
    <div className="flex w-full max-w-[640px] flex-col items-center gap-1">
      {bar({
        player: blackPlayer,
        seconds: blackTime,
        active: blackActive,
        showRestart: true,
      })}
      {children}
      {bar({
        player: whitePlayer,
        seconds: whiteTime,
        active: whiteActive,
      })}
    </div>
  );
}

export default Timer;
