import { Player } from "../models/Player";
import { classNames } from "../utils/classNames";
import { Figure } from "../models/figures/Figure";

interface PlayerBarProps {
  player: Player;
  seconds: number;
  active: boolean;
  actionLabel: string;
  onAction: () => void;
  capturedFigures: Figure[];
}

function PlayerBar({ player, seconds, active, actionLabel, onAction, capturedFigures }: PlayerBarProps) {
  return (
    <div
      className={classNames(
        "flex w-[640px] max-w-full flex-col gap-2 rounded-sm border px-3 py-2.5 transition-colors",
        active
          ? "border border-emerald-200 bg-emerald-50 text-chess-highlight ring-2 ring-chess-highlight/35"
          : "border border-slate-200 bg-slate-100 text-slate-600"
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="truncate text-sm font-semibold sm:text-base">{player.name}</span>
        <span className="rounded px-2.5 py-1 font-mono text-sm tabular-nums sm:text-base bg-white text-slate-700 shadow-sm">
          {new Date(seconds * 1000).toISOString().slice(14, 19)}
        </span>
        {actionLabel && (
          <button
            type="button"
            onClick={onAction}
            className="rounded px-2 py-1 text-xs font-medium text-slate-600 underline-offset-2 hover:text-slate-900 hover:underline"
          >
            {actionLabel}
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-1 text-xs">
        <span className="font-medium">Captured:</span>
        {capturedFigures.length > 0 && (
          capturedFigures.map((figure) => {
            const Logo = figure.Logo;
            return (
              <span key={figure.id} className="inline-flex items-center gap-1 rounded bg-slate-200 px-1 py-0.5">
                {Logo && <Logo width={16} height={16} />}
                {figure.name}
              </span>
            );
          })
        )}
      </div>
    </div>
  );
}

export default PlayerBar;
