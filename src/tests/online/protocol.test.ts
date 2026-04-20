import { describe, expect, it } from "vitest";
import { Colors } from "../../constants/chess/colors";
import { isRoomScopedServerMessage, type ServerToClientMessage } from "../../online/protocol";

describe("isRoomScopedServerMessage", () => {
  it("returns true for room lifecycle and move events", () => {
    const messages: ServerToClientMessage[] = [
      { type: "room_created", roomId: "ABC", hostId: "h1", hostNick: "Host" },
      { type: "joined", roomId: "ABC", guestId: "g1" },
      {
        type: "game_start",
        roomId: "ABC",
        whitePlayerId: "w1",
        blackPlayerId: "b1",
        whiteNick: "W",
        blackNick: "B",
        initialClockSeconds: 300,
      },
      {
        type: "move_applied",
        roomId: "ABC",
        uci: "e2e4",
        san: "e4",
        plyIndex: 1,
        byPlayerId: "w1",
        moverColor: Colors.WHITE,
        sideToMove: Colors.BLACK,
      },
      { type: "game_over", roomId: "ABC", reason: "checkmate" },
    ];
    for (const msg of messages) {
      expect(isRoomScopedServerMessage(msg)).toBe(true);
    }
  });

  it("returns false for room_snapshot, error, and pong", () => {
    const snapshot: ServerToClientMessage = {
      type: "room_snapshot",
      roomId: "ABC",
      v: 1,
      hostId: "h",
      hostNick: "H",
      timeControlSeconds: 300,
      moves: [],
    };
    const err: ServerToClientMessage = { type: "error", code: "X", message: "m" };
    const pong: ServerToClientMessage = { type: "pong" };

    expect(isRoomScopedServerMessage(snapshot)).toBe(false);
    expect(isRoomScopedServerMessage(err)).toBe(false);
    expect(isRoomScopedServerMessage(pong)).toBe(false);
  });
});
