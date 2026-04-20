import type { Colors } from "../models/Colors";

export const ONLINE_PROTOCOL_VERSION = "1" as const;

export type PlayerId = string;
export type RoomId = string;

/** Seconds per side at game start (matches Timer INITIAL_TIME). */
export const ONLINE_INITIAL_CLOCK_SECONDS = 300;

export type ClientToServerMessage =
  | {
      type: "create_room";
      playerId: PlayerId;
      nick: string;
      timeControlSeconds?: number;
    }
  | {
      type: "join_room";
      roomId: RoomId;
      playerId: PlayerId;
      nick: string;
    }
  | {
      type: "sync_room";
      roomId: RoomId;
      playerId: PlayerId;
    }
  | {
      type: "move";
      roomId: RoomId;
      playerId: PlayerId;
      uci: string;
      san: string;
      plyIndex: number;
    }
  | { type: "ping"; roomId: RoomId; playerId: PlayerId };

export type ServerToClientMessage =
  | {
      type: "room_created";
      roomId: RoomId;
      hostId: PlayerId;
      hostNick: string;
    }
  | {
      type: "room_snapshot";
      roomId: RoomId;
      v: number;
      hostId: PlayerId;
      hostNick: string;
      guestId?: PlayerId;
      guestNick?: string;
      whitePlayerId?: PlayerId;
      blackPlayerId?: PlayerId;
      timeControlSeconds: number;
      moves: { uci: string; san: string; by: PlayerId }[];
      gameOverReason?: string;
    }
  | {
      type: "joined";
      roomId: RoomId;
      guestId: PlayerId;
    }
  | {
      type: "game_start";
      roomId: RoomId;
      whitePlayerId: PlayerId;
      blackPlayerId: PlayerId;
      whiteNick: string;
      blackNick: string;
      initialClockSeconds: number;
    }
  | {
      type: "move_applied";
      roomId: RoomId;
      uci: string;
      san: string;
      plyIndex: number;
      byPlayerId: PlayerId;
      moverColor: Colors;
      sideToMove: Colors;
      whiteClockMs?: number;
      blackClockMs?: number;
    }
  | {
      type: "game_over";
      roomId: RoomId;
      reason: string;
    }
  | {
      type: "error";
      code: string;
      message: string;
    }
  | { type: "pong" };

export type WireEnvelope =
  | { source: "client"; roomId: RoomId | null; playerId: PlayerId; body: ClientToServerMessage }
  | { source: "server"; roomId: RoomId | null; body: ServerToClientMessage };
