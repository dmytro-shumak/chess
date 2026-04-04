import { useLayoutEffect, useRef } from "react";
import { classNames } from "../utils/classNames";

interface GameSidePanelProps {
  restartDisabled: boolean;
  onRestart: () => void;
  movePlies: string[];
}

function GameSidePanel({ restartDisabled, onRestart, movePlies }: GameSidePanelProps) {
  const historyScrollRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = historyScrollRef.current;
    if (!el || movePlies.length === 0) return;
    el.scrollTop = el.scrollHeight;
  }, [movePlies]);
  const rows: { num: number; white?: string; black?: string }[] = [];
  for (let i = 0; i < movePlies.length; i += 2) {
    rows.push({
      num: rows.length + 1,
      white: movePlies[i],
      black: movePlies[i + 1],
    });
  }

  const lastIdx = movePlies.length - 1;
  const highlightRow = lastIdx >= 0 ? Math.floor(lastIdx / 2) : -1;
  const highlightWhite = lastIdx >= 0 && lastIdx % 2 === 0;

  return (
    <aside className="ui-side-panel">
      <button
        type="button"
        disabled={restartDisabled}
        onClick={onRestart}
        className="ui-game-button ui-game-button--restart disabled:pointer-events-none disabled:opacity-40 disabled:grayscale"
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
                {rows.map((row, r) => (
                  <tr key={row.num} className="border-t border-slate-200/80 first:border-t-0">
                    <td className="py-1 pr-2 text-slate-400">{row.num}</td>
                    <td
                      className={`rounded px-1.5 py-1 ${
                        r === highlightRow && highlightWhite
                          ? "bg-amber-100/90 text-slate-900 ring-1 ring-amber-200/60"
                          : ""
                      }`}
                    >
                      {row.white ?? ""}
                    </td>
                    <td
                      className={classNames("rounded px-1.5 py-1", {
                        "bg-amber-100/90 text-slate-900 ring-1 ring-amber-200/60": r === highlightRow && !highlightWhite, 
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
    </aside>
  );
}

export default GameSidePanel;
