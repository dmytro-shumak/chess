import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useOnlineRuntime } from "../online/OnlineRuntimeContext";
import { onlineRoomPath, ROUTES } from "../routes";

export default function OnlineLobbyPage() {
  const navigate = useNavigate();
  const { transport, socketConnected } = useOnlineRuntime();
  const [nick, setNick] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [banner, setBanner] = useState<string | null>(null);

  async function handleCreate() {
    setBanner(null);
    try {
      const roomId = await transport.createRoom(nick);
      navigate(onlineRoomPath(roomId));
    } catch (e) {
      setBanner(e instanceof Error ? e.message : String(e));
    }
  }

  function handleJoin() {
    const code = joinCode.trim().toUpperCase();
    if (!code) return;
    
    navigate(onlineRoomPath(code));
  }

  return (
    <div className="box-border flex min-h-screen w-full flex-col items-center justify-center p-4">
      <div className="flex w-full max-w-md flex-col gap-6">
        <div>
          <Link to={ROUTES.home} className="text-sm font-medium text-sky-800 hover:underline">
            ← Home
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Online</h1>
          <p className="mt-1 text-sm text-slate-600">
            Play a live game with another person. Create a room and share the link, or join with a room code.
          </p>
        </div>

        {!socketConnected && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
            Not connected to the game server. Start the backend and check the URL.
          </p>
        )}

        {banner && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-950">
            {banner}
          </p>
        )}

        <label className="flex flex-col gap-1 text-sm font-medium text-slate-800">
          Nickname
          <input
            value={nick}
            onChange={(e) => setNick(e.target.value)}
            placeholder="Player"
            className="rounded-lg border border-slate-300 px-3 py-2 text-base shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </label>

        <button
          type="button"
          onClick={() => void handleCreate()}
          disabled={!socketConnected}
          className="ui-game-button from-sky-700 via-sky-800 to-sky-950 disabled:pointer-events-none disabled:opacity-50"
        >
          Create room
        </button>

        <div className="relative py-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">
          <span className="relative z-10 bg-white px-2">or join</span>
          <span className="absolute inset-x-0 top-1/2 z-0 h-px bg-slate-200" aria-hidden />
        </div>

        <div className="flex gap-2">
          <input
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="Room code"
            maxLength={8}
            className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 font-mono text-base uppercase shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
          <button
            type="button"
            onClick={handleJoin}
            className="ui-game-button w-auto shrink-0 from-slate-700 via-slate-800 to-slate-950"
          >
            Join
          </button>
        </div>
      </div>
    </div>
  );
}
