interface GameSidePanelProps {
  restartDisabled: boolean;
  onRestart: () => void;
}

function GameSidePanel({ restartDisabled, onRestart }: GameSidePanelProps) {
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

      <section className="flex min-h-[200px] flex-col rounded-xl border border-dashed border-slate-300/90 bg-white/60 p-4 shadow-inner">
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Move history</h2>
        <div className="mt-6 flex flex-1 items-center justify-center rounded-lg bg-slate-100/80 py-10">
          <p className="text-center text-sm font-medium text-slate-400">No moves yet.</p>
        </div>
      </section>
    </aside>
  );
}

export default GameSidePanel;
