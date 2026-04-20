import { io, type Socket } from "socket.io-client";
import type { ClientToServerMessage, PlayerId, RoomId, ServerToClientMessage } from "./protocol";

const DEFAULT_SOCKET_URL = "http://127.0.0.1:3001";

export interface IOnlineTransport {
  connect(): void;
  dispose(): void;
  onMessage(handler: (msg: ServerToClientMessage) => void): () => void;
  onConnectionState(handler: (connected: boolean) => void): () => void;
  watchRoom(roomId: RoomId | null): void;
  createRoom(nick: string, timeControlSeconds?: number): Promise<RoomId>;
  joinRoom(roomId: RoomId, nick: string): void;
  sendMove(roomId: RoomId, uci: string, san: string, plyIndex: number): void;
}

export class SocketTransport implements IOnlineTransport {
  private readonly playerId: PlayerId;
  private readonly url: string;
  private socket: Socket | null = null;
  private readonly handlers = new Set<(msg: ServerToClientMessage) => void>();
  private readonly connectionHandlers = new Set<(connected: boolean) => void>();
  private readonly outbox: ClientToServerMessage[] = [];
  private watchedRoomId: RoomId | null = null;
  private joinedSocketRoom: RoomId | null = null;

  constructor(playerId: PlayerId) {
    this.playerId = playerId;
    this.url = (import.meta.env.VITE_ONLINE_SOCKET_URL as string | undefined) ?? DEFAULT_SOCKET_URL;
  }

  connect(): void {
    if (this.socket?.connected) return;
    if (this.socket) {
      this.socket.connect();
      return;
    }

    this.socket = io(this.url, {
      autoConnect: true,
      transports: ["websocket", "polling"],
      query: { playerId: this.playerId },
    });

    this.socket.on("connect", () => {
      this.notifyConnection(true);
      this.flushOutbox();
      this.reapplyRoomWatch();
    });

    this.socket.on("disconnect", () => {
      this.notifyConnection(false);
    });

    this.socket.on("connect_error", () => {
      this.notifyConnection(false);
    });

    this.socket.on("s2c", (msg: ServerToClientMessage) => {
      this.handlers.forEach((h) => {
        h(msg);
      });
    });
  }

  dispose(): void {
    this.handlers.clear();
    this.connectionHandlers.clear();
    this.outbox.length = 0;
    this.watchedRoomId = null;
    this.joinedSocketRoom = null;
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
  }

  onMessage(handler: (msg: ServerToClientMessage) => void): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  onConnectionState(handler: (connected: boolean) => void): () => void {
    this.connectionHandlers.add(handler);
    handler(Boolean(this.socket?.connected));
    return () => this.connectionHandlers.delete(handler);
  }

  watchRoom(roomId: RoomId | null): void {
    if (this.joinedSocketRoom && this.socket?.connected) {
      this.socket.emit("leave_room", { roomId: this.joinedSocketRoom });
    }
    this.joinedSocketRoom = null;
    this.watchedRoomId = roomId ? roomId.toUpperCase() : null;
    this.reapplyRoomWatch();
  }

  createRoom(nick: string, timeControlSeconds?: number): Promise<RoomId> {
    return new Promise((resolve, reject) => {
      const timeout = window.setTimeout(() => {
        unsubscribe();
        reject(new Error("Timed out waiting for room_created."));
      }, 20_000);

      const unsubscribe = this.onMessage((m) => {
        if (m.type === "room_created" && m.hostId === this.playerId) {
          window.clearTimeout(timeout);
          unsubscribe();
          resolve(m.roomId.toUpperCase());
        }
        if (m.type === "error") {
          window.clearTimeout(timeout);
          unsubscribe();
          reject(new Error(m.message));
        }
      });

      this.emitC2s({
        type: "create_room",
        playerId: this.playerId,
        nick: nick.trim() || "Player",
        timeControlSeconds,
      });
    });
  }

  joinRoom(roomId: RoomId, nick: string): void {
    this.emitC2s({
      type: "join_room",
      roomId: roomId.toUpperCase(),
      playerId: this.playerId,
      nick: nick.trim() || "Guest",
    });
  }

  sendMove(roomId: RoomId, uci: string, san: string, plyIndex: number): void {
    this.emitC2s({
      type: "move",
      roomId: roomId.toUpperCase(),
      playerId: this.playerId,
      uci,
      san,
      plyIndex,
    });
  }

  private notifyConnection(connected: boolean): void {
    this.connectionHandlers.forEach((h) => {
      h(connected);
    });
  }

  private emitC2s(msg: ClientToServerMessage): void {
    if (!this.socket?.connected) {
      this.outbox.push(msg);
      return;
    }
    this.socket.emit("c2s", msg);
  }

  private flushOutbox(): void {
    if (!this.socket?.connected) return;
    while (this.outbox.length > 0) {
      const msg = this.outbox.shift();
      if (msg === undefined) break;
      this.socket.emit("c2s", msg);
    }
  }

  private reapplyRoomWatch(): void {
    const roomId = this.watchedRoomId;
    if (!roomId || !this.socket?.connected) return;
    this.socket.emit("join_room", { roomId });
    this.joinedSocketRoom = roomId;
    this.emitC2s({ type: "sync_room", roomId, playerId: this.playerId });
  }
}
