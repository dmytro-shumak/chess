import type { CapturedDisplay } from "../types/chess/capturedDisplay";
import type { Player } from "../types/chess/player";
import {
  groupCapturedForDisplay,
  pieceWordFromCaptureLabel,
} from "../utils/chess/groupCapturedForDisplay";
import { classNames } from "../utils/classNames";
import { formatMinutesSeconds } from "../utils/formatClock";

interface PlayerBarProps {
  player: Player;
  // when undefined, no clock is shown
  seconds?: number;
  active: boolean;
  capturedFigures: CapturedDisplay[];
}

function PlayerBar({ player, seconds, active, capturedFigures }: PlayerBarProps) {
  const figures = groupCapturedForDisplay(capturedFigures);

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
        {seconds !== undefined && (
          <span className="rounded px-2.5 py-1 font-mono text-sm tabular-nums sm:text-base bg-white text-slate-700 shadow-sm">
            {formatMinutesSeconds(seconds)}
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-1 text-xs">
        <span className="font-medium">Captured:</span>
        {figures.map((figure) => {
          const PieceIcon = figure.Logo;
          return (
            <span
              key={figure.label}
              className="inline-flex items-center gap-1 rounded bg-slate-200 px-1 py-0.5"
            >
              <span className="inline-flex items-center" aria-hidden>
                {figure.keys.map((k) => (
                  <PieceIcon key={k} width={16} height={16} />
                ))}
              </span>
              <span>{pieceWordFromCaptureLabel(figure.label)}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

export default PlayerBar;
