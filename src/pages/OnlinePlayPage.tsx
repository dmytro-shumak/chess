import { Link, Navigate } from "react-router-dom";
import { onlineRoomPath, ROUTES } from "../routes";
import { useOnlineRuntime } from "../online/OnlineRuntimeContext";
import { useOnlineRoom } from "../online/OnlineRoomContext";
import { isRoomMember, roomGameStarted } from "../online/roomState";
import OnlineChessGame from "../components/OnlineChessGame";

export default function OnlinePlayPage() {
  const { playerId } = useOnlineRuntime();
  const { room, roomId, syncError, roomLoading } = useOnlineRoom();

  if (syncError) {
    return <Navigate to={ROUTES.online} replace />;
  }

  if (roomLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
        <p className="text-slate-600">Loading…</p>
        <Link to={ROUTES.online} className="text-sm font-medium text-sky-800 hover:underline">
          Lobby
        </Link>
      </div>
    );
  }

  if (!room) {
    return <Navigate to={onlineRoomPath(roomId)} replace />;
  }

  if (!isRoomMember(room, playerId)) {
    return <Navigate to={ROUTES.online} replace />;
  }

  if (!roomGameStarted(room)) {
    return <Navigate to={onlineRoomPath(roomId)} replace />;
  }

  return <OnlineChessGame />;
}
