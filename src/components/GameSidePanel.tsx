import { type ReactNode, useLayoutEffect, useMemo, useRef } from "react";
import { classNames } from "../utils/classNames";

interface GameSidePanelProps {
  restartDisabled: boolean;
  onRestart: () => void;
  movePlies: string[];
  footer?: ReactNode;
}

function GameSidePanel({ restartDisabled, onRestart, movePlies, footer }: GameSidePanelProps) {
  const historyScrollRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = historyScrollRef.current;
    if (!el || movePlies.length === 0) return;
    el.scrollTop = el.scrollHeight;
  }, [movePlies]);

  const moveRows = useMemo(() => {
    const rows: { num: number; white?: string; black?: string }[] = [];
    for (let whitePlyIndex = 0; whitePlyIndex < movePlies.length; whitePlyIndex += 2) {
      rows.push({
        num: rows.length + 1,
        white: movePlies[whitePlyIndex],
        black: movePlies[whitePlyIndex + 1],
      });
    }
    return rows;
  }, [movePlies]);

  const lastPlyIndex = movePlies.length - 1;
  const highlightFullMoveIndex = lastPlyIndex >= 0 ? Math.floor(lastPlyIndex / 2) : -1;
  const highlightLastMoveWasWhite = lastPlyIndex >= 0 && lastPlyIndex % 2 === 0;

  return (
    <aside className="ui-side-panel">
      <button
        type="button"
        disabled={restartDisabled}
        onClick={onRestart}
        className="ui-game-button from-amber-500 via-amber-600 to-amber-900 shadow-glow-amber disabled:pointer-events-none disabled:opacity-40 disabled:grayscale"
      >
        <span className="relative z-10 drop-shadow-sm">Restart</span>
      </button>

      <section className="flex h-[min(360px,42vh)] flex-col overflow-hidden rounded-xl border border-slate-200/90 bg-white/80 p-3 shadow-inner ring-1 ring-slate-900/5">
        <h2 className="shrink-0 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-slate-500">
          Move history
        </h2>
        {movePlies.length === 0 ? (
          <div className="mt-4 flex min-h-0 flex-1 items-center justify-center rounded-lg bg-slate-100/90 py-10">
            <p className="text-center text-sm font-medium text-slate-400">No moves yet.</p>
          </div>
        ) : (
          <div
            ref={historyScrollRef}
            className="mt-3 min-h-0 flex-1 overflow-y-auto overflow-x-auto"
          >
            <table className="w-full border-collapse text-sm tabular-nums text-slate-700">
              <thead className="sticky top-0 z-1 bg-white/95 backdrop-blur-sm">
                <tr className="text-left text-[0.65rem] font-semibold uppercase tracking-wide text-slate-500">
                  <th className="w-10 py-1.5 pr-2 font-medium">#</th>
                  <th className="px-1.5 py-1.5 font-medium">White</th>
                  <th className="px-1.5 py-1.5 font-medium">Black</th>
                </tr>
              </thead>
              <tbody>
                {moveRows.map((row, index) => (
                  <tr key={row.num} className="border-t border-slate-200/80 first:border-t-0">
                    <td className="py-1 pr-2 text-slate-400">{row.num}</td>
                    <td
                      className={`rounded px-1.5 py-1 ${
                        index === highlightFullMoveIndex && highlightLastMoveWasWhite
                          ? "bg-amber-100/90 text-slate-900 ring-1 ring-amber-200/60"
                          : ""
                      }`}
                    >
                      {row.white ?? ""}
                    </td>
                    <td
                      className={classNames("rounded px-1.5 py-1", {
                        "bg-amber-100/90 text-slate-900 ring-1 ring-amber-200/60":
                          index === highlightFullMoveIndex && !highlightLastMoveWasWhite,
                      })}
                    >
                      {row.black ?? ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      {footer ? (
        <div className="mt-4 shrink-0 rounded-xl border border-slate-200/90 bg-white/80 p-3 shadow-inner ring-1 ring-slate-900/5">
          {footer}
        </div>
      ) : null}
    </aside>
  );
}

export default GameSidePanel;
