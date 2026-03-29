import { GameStatus } from "../models/GameStatus";

interface GameSidePanelProps {
  gameStatus: GameStatus;
  onStartGame: () => void;
  onRestart: () => void;
}

function GameSidePanel({ gameStatus, onStartGame, onRestart }: GameSidePanelProps) {
  const isNotStarted = gameStatus === GameStatus.NOT_STARTED;

  return (
    <aside className="ui-side-panel">
      <button
        type="button"
        onClick={isNotStarted ? onStartGame : onRestart}
        className={isNotStarted ? "ui-game-button ui-game-button--start" : "ui-game-button ui-game-button--restart"}
      >
        <span className="relative z-10 drop-shadow-sm">{isNotStarted ? "Start game" : "Restart"}</span>
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
