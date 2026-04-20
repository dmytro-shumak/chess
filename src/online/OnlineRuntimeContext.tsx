import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getOrCreatePlayerId } from "./playerId";
import { SocketTransport } from "./socketTransport";
import type { PlayerId } from "./protocol";

type OnlineRuntimeValue = {
  playerId: PlayerId;
  transport: SocketTransport;
  socketConnected: boolean;
};

const OnlineRuntimeContext = createContext<OnlineRuntimeValue | null>(null);

export function OnlineRuntimeProvider({ children }: { children: ReactNode }) {
  const playerId = useMemo(() => getOrCreatePlayerId(), []);
  const transport = useMemo(() => new SocketTransport(playerId), [playerId]);
  const [socketConnected, setSocketConnected] = useState(false);

  useEffect(() => {
    transport.connect();
    return transport.onConnectionState(setSocketConnected);
  }, [transport]);

  useEffect(() => {
    return () => transport.dispose();
  }, [transport]);

  const value = useMemo(
    () => ({ playerId, transport, socketConnected }),
    [playerId, transport, socketConnected],
  );

  return <OnlineRuntimeContext.Provider value={value}>{children}</OnlineRuntimeContext.Provider>;
}

export function useOnlineRuntime(): OnlineRuntimeValue {
  const ctx = useContext(OnlineRuntimeContext);
  if (!ctx) {
    throw new Error("useOnlineRuntime must be used under OnlineRuntimeProvider");
  }
  return ctx;
}
