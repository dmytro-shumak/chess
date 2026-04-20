import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { useOnlineRuntime } from "./OnlineRuntimeContext";
import type { RoomId, ServerToClientMessage } from "./protocol";
import { applyServerMessage, type ClientRoomState } from "./roomState";

type OnlineRoomValue = {
  room: ClientRoomState | null;
  roomId: RoomId;
  syncError: string | null;
  roomLoading: boolean;
};

const OnlineRoomContext = createContext<OnlineRoomValue | null>(null);

export function OnlineRoomProvider({ roomId, children }: { roomId: RoomId; children: ReactNode }) {
  const { transport } = useOnlineRuntime();
  const [room, setRoom] = useState<ClientRoomState | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  useEffect(() => {
    setRoom(null);
    setSyncError(null);
    transport.watchRoom(roomId);

    function handleMessage(msg: ServerToClientMessage): void {
      if (msg.type === "error") {
        if (msg.code === "ROOM_NOT_FOUND") {
          setSyncError(msg.message);
          setRoom(null);
        }
        return;
      }
      if (
        msg.type === "room_snapshot" ||
        (msg.type === "room_created" && msg.roomId.toUpperCase() === roomId.toUpperCase())
      ) {
        setSyncError(null);
      }
      setRoom((prev) => applyServerMessage(prev, msg, roomId));
    }

    const unsub = transport.onMessage(handleMessage);
    return () => {
      unsub();
      transport.watchRoom(null);
    };
  }, [transport, roomId]);

  const roomLoading = room === null && syncError === null;

  const value = useMemo(
    () => ({ room, roomId, syncError, roomLoading }),
    [room, roomId, syncError, roomLoading],
  );

  return <OnlineRoomContext.Provider value={value}>{children}</OnlineRoomContext.Provider>;
}

export function useOnlineRoom(): OnlineRoomValue {
  const ctx = useContext(OnlineRoomContext);
  if (!ctx) {
    throw new Error("useOnlineRoom must be used under OnlineRoomProvider");
  }
  return ctx;
}
