import { Link } from "react-router-dom";
import { ROUTES } from "../routes";

export default function HomePage() {
  return (
    <div className="box-border flex min-h-screen w-full flex-col items-center justify-center p-4">
      <div className="flex w-full max-w-md flex-col items-center gap-4">
        <h1 className="text-center text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Chess</h1>
        <p className="mb-2 text-center text-sm text-slate-600 sm:text-base">Choose how you want to play</p>
        <div className="flex w-full flex-col gap-3">
          <Link
            to={ROUTES.local}
            className="ui-game-button block bg-linear-to-br from-slate-700 via-slate-800 to-slate-950 text-center shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
          >
            Local game
          </Link>
          <Link
            to={ROUTES.vsComputer}
            className="ui-game-button block bg-linear-to-br from-emerald-700 via-emerald-800 to-emerald-950 text-center shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2"
          >
            Play vs computer
          </Link>
          <button
            type="button"
            disabled
            className="ui-game-button pointer-events-none cursor-not-allowed bg-linear-to-br from-slate-400 via-slate-500 to-slate-600 opacity-60 shadow-none"
          >
            Online game
          </button>
        </div>
      </div>
    </div>
  );
}
