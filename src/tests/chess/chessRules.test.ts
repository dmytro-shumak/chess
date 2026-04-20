import { Chess, PAWN, QUEEN } from "chess.js";
import { describe, expect, it } from "vitest";
import { replayMovesFromUci } from "../../utils/chess/replayMovesFromUci";
import { parseUci } from "../../utils/chess/uci";

describe("parseUci", () => {
  it("parses quiet move", () => {
    expect(parseUci("e2e4")).toEqual({ from: "e2", to: "e4" });
  });

  it("parses promotion", () => {
    expect(parseUci("e7e8q")).toEqual({ from: "e7", to: "e8", promotion: QUEEN });
  });

  it("returns null for garbage", () => {
    expect(parseUci("z9z9")).toBeNull();
  });
});

describe("chess.js moves", () => {
  it("allows opening e4", () => {
    const c = new Chess();
    const m = c.move({ from: "e2", to: "e4" });
    expect(m).not.toBeNull();
    expect(c.get("e4")?.type).toBe(PAWN);
  });

  it("rejects wrong side to move", () => {
    const c = new Chess();
    expect(() => c.move({ from: "e7", to: "e5" })).toThrow();
  });

  it("allows castling when legal", () => {
    const c = new Chess("r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1");
    const m = c.move({ from: "e1", to: "g1" });
    expect(m?.san).toBe("O-O");
  });
});

describe("replayMovesFromUci", () => {
  it("replays opening moves and SAN list", () => {
    const moves = [
      { uci: "e2e4", san: "e4" },
      { uci: "e7e5", san: "e5" },
    ];
    const r = replayMovesFromUci(moves, "t1");
    expect(r.movePlies).toEqual(["e4", "e5"]);
    expect(r.chess.get("e4")?.type).toBe(PAWN);
    expect(r.chess.get("e5")?.type).toBe(PAWN);
    expect(r.lastHighlight).toEqual({ from: "e7", to: "e5" });
  });

  it("skips invalid UCI and continues", () => {
    const moves = [
      { uci: "e2e4", san: "e4" },
      { uci: "z9z9", san: "??" },
      { uci: "e7e5", san: "e5" },
    ];
    const r = replayMovesFromUci(moves, "t2");
    expect(r.movePlies).toEqual(["e4", "??", "e5"]);
    expect(r.chess.get("e5")).toBeDefined();
  });
});
