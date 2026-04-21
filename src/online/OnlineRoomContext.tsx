import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useOnlineRuntime } from "./OnlineRuntimeContext";
import type { RoomId, ServerToClientMessage } from "./protocol";
import { applyServerMessage, type ClientRoomState } from "./roomState";

type OnlineRoomValue = {
  room: ClientRoomState | null;
  roomId: RoomId;
  syncError: string | null;
  actionError: string | null;
  clearActionError: () => void;
  roomLoading: boolean;
};

const OnlineRoomContext = createContext<OnlineRoomValue | null>(null);

export function OnlineRoomProvider({ roomId, children }: { roomId: RoomId; children: ReactNode }) {
  const { transport } = useOnlineRuntime();
  const [room, setRoom] = useState<ClientRoomState | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const roomRef = useRef<ClientRoomState | null>(null);
  roomRef.current = room;

  const clearActionError = useCallback(() => {
    setActionError(null);
  }, []);

  useEffect(() => {
    setRoom(null);
    setSyncError(null);
    setActionError(null);
    transport.watchRoom(roomId);

    function handleMessage(msg: ServerToClientMessage): void {
      if (msg.type === "error") {
        if (msg.code === "ROOM_NOT_FOUND") {
          setSyncError(msg.message);
          setRoom(null);
          setActionError(null);
          return;
        }
        if (roomRef.current !== null) {
          setActionError(msg.message);
          return;
        }
        setSyncError(msg.message);
        setRoom(null);
        setActionError(null);
        return;
      }
      if (
        msg.type === "room_snapshot" ||
        (msg.type === "room_created" && msg.roomId.toUpperCase() === roomId.toUpperCase())
      ) {
        setSyncError(null);
        setActionError(null);
      }
      setRoom((prev) => applyServerMessage(prev, msg, roomId));
    }

    const unsubscribe = transport.onMessage(handleMessage);
    return () => {
      unsubscribe();
      transport.watchRoom(null);
    };
  }, [transport, roomId]);

  const roomLoading = room === null && syncError === null;

  const value = useMemo(
    () => ({
      room,
      roomId,
      syncError,
      actionError,
      clearActionError,
      roomLoading,
    }),
    [room, roomId, syncError, actionError, clearActionError, roomLoading],
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
