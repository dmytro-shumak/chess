import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { onlinePlayPath, ROUTES } from "../routes";
import { useOnlineRuntime } from "../online/OnlineRuntimeContext";
import { useOnlineRoom } from "../online/OnlineRoomContext";
import { isRoomMember, roomGameStarted } from "../online/roomState";

export default function OnlineRoomPage() {
  const navigate = useNavigate();
  const { playerId, transport } = useOnlineRuntime();
  const { room, roomId, syncError, roomLoading } = useOnlineRoom();
  const [guestNick, setGuestNick] = useState("");
  const [banner, setBanner] = useState<string | null>(null);

  useEffect(() => {
    const unsub = transport.onMessage((msg) => {
      if (msg.type === "error" && msg.code !== "ROOM_NOT_FOUND") {
        setBanner(msg.message);
      }
    });
    return unsub;
  }, [transport]);

  useEffect(() => {
    if (room && roomGameStarted(room) && isRoomMember(room, playerId)) {
      navigate(onlinePlayPath(room.roomId), { replace: true });
    }
  }, [room, playerId, navigate]);

  if (syncError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
        <p className="text-center text-slate-600">{syncError}</p>
        <Link to={ROUTES.online} className="text-sm font-medium text-sky-800 hover:underline">
          Back to lobby
        </Link>
      </div>
    );
  }

  if (roomLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
        <p className="text-slate-600">Loading room…</p>
        <Link to={ROUTES.online} className="text-sm font-medium text-sky-800 hover:underline">
          Back to lobby
        </Link>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
        <p className="text-slate-600">No room data.</p>
        <Link to={ROUTES.online} className="text-sm font-medium text-sky-800 hover:underline">
          Back to lobby
        </Link>
      </div>
    );
  }

  const member = isRoomMember(room, playerId);

  function handleJoin() {
    setBanner(null);
    transport.joinRoom(roomId, guestNick);
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col gap-6 p-4">
      <div>
        <Link to={ROUTES.online} className="text-sm font-medium text-sky-800 hover:underline">
          ← Lobby
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Room {room.roomId}</h1>
      </div>

      {banner && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">{banner}</p>
      )}

      {!member && (
        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-700">Join this room as the second player.</p>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-800">
            Nickname
            <input
              value={guestNick}
              onChange={(e) => setGuestNick(e.target.value)}
              placeholder="Guest"
              className="rounded-lg border border-slate-300 px-3 py-2 text-base shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </label>
          <button type="button" onClick={handleJoin} className="ui-game-button bg-sky-800 shadow">
            Join room
          </button>
        </div>
      )}

      {member && !roomGameStarted(room) && (
        <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-700">Waiting for an opponent…</p>
          <p className="text-xs text-slate-500">Share this URL:</p>
          <code className="break-all rounded bg-slate-100 px-2 py-2 text-xs text-slate-800">
            {`${window.location.origin}/online/room/${room.roomId}`}
          </code>
        </div>
      )}

      {member && roomGameStarted(room) && <p className="text-sm text-slate-600">Starting game…</p>}
    </div>
  );
}
