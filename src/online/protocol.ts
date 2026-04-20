import type { Colors } from "../constants/chess/colors";

export type PlayerId = string;
export type RoomId = string;

export const ONLINE_INITIAL_CLOCK_SECONDS = 300;

export type CreateRoomMessage = {
  type: "create_room";
  playerId: PlayerId;
  nick: string;
  timeControlSeconds?: number;
};

export type JoinRoomC2sMessage = {
  type: "join_room";
  roomId: RoomId;
  playerId: PlayerId;
  nick: string;
};

export type SyncRoomMessage = {
  type: "sync_room";
  roomId: RoomId;
  playerId: PlayerId;
};

export type MoveC2sMessage = {
  type: "move";
  roomId: RoomId;
  playerId: PlayerId;
  uci: string;
  san: string;
  plyIndex: number;
};

export type PingC2sMessage = {
  type: "ping";
  roomId: RoomId;
  playerId: PlayerId;
};

export type ClientToServerMessage =
  | CreateRoomMessage
  | JoinRoomC2sMessage
  | SyncRoomMessage
  | MoveC2sMessage
  | PingC2sMessage;

export type RoomMoveWire = { uci: string; san: string; by: PlayerId };

export type RoomCreatedMessage = {
  type: "room_created";
  roomId: RoomId;
  hostId: PlayerId;
  hostNick: string;
};

export type RoomSnapshotMessage = {
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
  moves: RoomMoveWire[];
  gameOverReason?: string;
};

export type JoinedMessage = {
  type: "joined";
  roomId: RoomId;
  guestId: PlayerId;
};

export type GameStartMessage = {
  type: "game_start";
  roomId: RoomId;
  whitePlayerId: PlayerId;
  blackPlayerId: PlayerId;
  whiteNick: string;
  blackNick: string;
  initialClockSeconds: number;
};

export type MoveAppliedMessage = {
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
};

export type GameOverMessage = {
  type: "game_over";
  roomId: RoomId;
  reason: string;
};

export type ErrorMessage = {
  type: "error";
  code: string;
  message: string;
};

export type PongMessage = { type: "pong" };

export type ServerToClientMessage =
  | RoomCreatedMessage
  | RoomSnapshotMessage
  | JoinedMessage
  | GameStartMessage
  | MoveAppliedMessage
  | GameOverMessage
  | ErrorMessage
  | PongMessage;

export const ROOM_SCOPED_SERVER_MESSAGE_TYPES = [
  "room_created",
  "joined",
  "game_start",
  "move_applied",
  "game_over",
];

export type RoomScopedServerMessage = Extract<
  ServerToClientMessage,
  { type: (typeof ROOM_SCOPED_SERVER_MESSAGE_TYPES)[number] }
>;

export function isRoomScopedServerMessage(
  msg: ServerToClientMessage,
): msg is RoomScopedServerMessage {
  return ROOM_SCOPED_SERVER_MESSAGE_TYPES.includes(msg.type);
}
