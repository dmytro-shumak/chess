import { Link } from "react-router-dom";
import { ROUTES } from "../routes";

export default function HomePage() {
  return (
    <div className="box-border flex min-h-screen w-full flex-col items-center justify-center p-4">
      <div className="flex w-full max-w-md flex-col items-center gap-4">
        <h1 className="text-center text-3xl font-bold tracking-tight text-slate-900">Chess</h1>
        <p className="mb-2 text-center text-sm text-slate-600">Choose how you want to play</p>
        <div className="flex w-full flex-col gap-3">
          <Link
            to={ROUTES.local}
            className="ui-game-button from-slate-700 via-slate-800 to-slate-950"
          >
            Local game
          </Link>
          <Link
            to={ROUTES.vsComputer}
            className="ui-game-button from-emerald-700 via-emerald-800 to-emerald-950"
          >
            Play vs computer
          </Link>
          <Link to={ROUTES.online} className="ui-game-button from-sky-700 via-sky-800 to-sky-950">
            Online game
          </Link>
        </div>
      </div>
    </div>
  );
}
