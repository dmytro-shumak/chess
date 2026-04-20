import { Colors } from "../models/Colors";
import type { PlayerId, RoomId, ServerToClientMessage } from "./protocol";
import { ONLINE_INITIAL_CLOCK_SECONDS } from "./protocol";

export type ClientRoomMove = { uci: string; san: string; by: PlayerId };

export interface ClientRoomState {
  v: number;
  roomId: RoomId;
  hostId: PlayerId;
  hostNick: string;
  guestId?: PlayerId;
  guestNick?: string;
  whitePlayerId?: PlayerId;
  blackPlayerId?: PlayerId;
  timeControlSeconds: number;
  moves: ClientRoomMove[];
  gameOverReason?: string;
}

export function roomGameStarted(state: ClientRoomState | null): boolean {
  return Boolean(state?.guestId && state.whitePlayerId && state.blackPlayerId);
}

export function myColorInRoom(state: ClientRoomState | null, playerId: PlayerId): Colors | null {
  if (!state?.whitePlayerId || !state.blackPlayerId) return null;
  if (state.whitePlayerId === playerId) return Colors.WHITE;
  if (state.blackPlayerId === playerId) return Colors.BLACK;
  return null;
}

export function isRoomMember(state: ClientRoomState | null, playerId: PlayerId): boolean {
  if (!state) return false;
  return state.hostId === playerId || state.guestId === playerId;
}

function sameRoom(a: RoomId, b: RoomId): boolean {
  return a.toUpperCase() === b.toUpperCase();
}

export function applyServerMessage(
  prev: ClientRoomState | null,
  msg: ServerToClientMessage,
  contextRoomId: RoomId,
): ClientRoomState | null {
  const ctx = contextRoomId.toUpperCase();

  if (msg.type === "pong") return prev;

  if (msg.type === "error") return prev;

  if (msg.type === "room_snapshot") {
    if (!sameRoom(msg.roomId, ctx)) return prev;
    return {
      v: msg.v,
      roomId: msg.roomId.toUpperCase(),
      hostId: msg.hostId,
      hostNick: msg.hostNick,
      guestId: msg.guestId,
      guestNick: msg.guestNick,
      whitePlayerId: msg.whitePlayerId,
      blackPlayerId: msg.blackPlayerId,
      timeControlSeconds: msg.timeControlSeconds,
      moves: msg.moves.map((m) => ({ ...m })),
      gameOverReason: msg.gameOverReason,
    };
  }

  const msgRoom =
    msg.type === "room_created" || msg.type === "joined" || msg.type === "game_start" || msg.type === "move_applied" || msg.type === "game_over"
      ? msg.roomId
      : null;
  if (msgRoom && !sameRoom(msgRoom, ctx)) return prev;

  switch (msg.type) {
    case "room_created":
      if (prev && sameRoom(prev.roomId, msg.roomId)) return prev;
      return {
        v: 1,
        roomId: msg.roomId.toUpperCase(),
        hostId: msg.hostId,
        hostNick: msg.hostNick,
        moves: [],
        timeControlSeconds: ONLINE_INITIAL_CLOCK_SECONDS,
      };
    case "joined":
      if (!prev) return prev;
      if (prev.guestId === msg.guestId) return prev;
      return { ...prev, v: prev.v + 1, guestId: msg.guestId };
    case "game_start": {
      if (!prev?.guestId) return prev;
      if (prev.whitePlayerId && prev.blackPlayerId) return prev;
      const hostNick =
        prev.hostId === msg.whitePlayerId ? msg.whiteNick : msg.blackNick;
      const guestNick =
        prev.guestId === msg.whitePlayerId ? msg.whiteNick : msg.blackNick;
      return {
        ...prev,
        v: prev.v + 1,
        hostNick,
        guestNick,
        whitePlayerId: msg.whitePlayerId,
        blackPlayerId: msg.blackPlayerId,
        timeControlSeconds: msg.initialClockSeconds,
      };
    }
    case "move_applied": {
      if (!prev) return prev;
      if (prev.moves.length >= msg.plyIndex) return prev;
      return {
        ...prev,
        v: prev.v + 1,
        moves: [...prev.moves, { uci: msg.uci, san: msg.san, by: msg.byPlayerId }],
      };
    }
    case "game_over":
      if (!prev) return prev;
      return { ...prev, v: prev.v + 1, gameOverReason: msg.reason };
    default:
      return prev;
  }
}
