import { Navigate, Outlet, useParams } from "react-router-dom";
import { OnlineRoomProvider } from "../online/OnlineRoomContext";
import { ROUTES } from "../routes";

export default function OnlineRoomLayout() {
  const { roomId } = useParams();
  if (!roomId) {
    return <Navigate to={ROUTES.online} replace />;
  }
  return (
    <OnlineRoomProvider roomId={roomId.toUpperCase()}>
      <Outlet />
    </OnlineRoomProvider>
  );
}
