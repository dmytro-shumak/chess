import { Player } from "../models/Player";
import { classNames } from "../utils/classNames";
import type { CapturedDisplay } from "../chess/capturedFromMove";

interface PlayerBarProps {
  player: Player;
  /** When omitted, no clock is shown (e.g. vs computer). */
  seconds?: number;
  active: boolean;
  capturedFigures: CapturedDisplay[];
}

function PlayerBar({ player, seconds, active, capturedFigures }: PlayerBarProps) {
  return (
    <div
      className={classNames(
        "flex w-[640px] max-w-full flex-col gap-2 rounded-sm border px-3 py-2.5 ring-2 transition-[color,background-color,border-color,box-shadow]",
        active
          ? "border border-emerald-200 bg-emerald-50 text-chess-highlight ring-chess-highlight/35"
          : "border border-slate-200 bg-slate-100 text-slate-600 ring-transparent",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="truncate text-sm font-semibold sm:text-base">{player.name}</span>
        {seconds != null && (
          <span className="rounded px-2.5 py-1 font-mono text-sm tabular-nums sm:text-base bg-white text-slate-700 shadow-sm">
            {new Date(seconds * 1000).toISOString().slice(14, 19)}
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-1 text-xs">
        <span className="font-medium">Captured:</span>
        {capturedFigures.length > 0 &&
          capturedFigures.map((c) => (
            <span key={c.key} className="inline-flex items-center gap-1 rounded bg-slate-200 px-1 py-0.5">
              <c.Logo width={16} height={16} />
              {c.label}
            </span>
          ))}
      </div>
    </div>
  );
}

export default PlayerBar;
