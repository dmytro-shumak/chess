import { Chess, WHITE } from "chess.js";
import { describe, expect, it } from "vitest";
import { Colors } from "../../constants/chess/colors";
import { GameStatus } from "../../constants/chess/gameStatus";
import { capturedDisplayFromMove } from "../../utils/chess/capturedFromMove";
import { gameStatusFromChess } from "../../utils/chess/gameStatusFromChess";
import { squareFileAndRank } from "../../utils/chess/squareCoords";
import { squaresInDisplayOrder } from "../../utils/chess/squares";

describe("gameStatusFromChess", () => {
  it("returns ACTIVE for starting position", () => {
    expect(gameStatusFromChess(new Chess())).toBe(GameStatus.ACTIVE);
  });

  it("detects checkmate on white (fool's mate pattern)", () => {
    const chess = new Chess();
    chess.move("f3");
    chess.move("e5");
    chess.move("g4");
    chess.move("Qh4");
    expect(chess.isCheckmate()).toBe(true);
    expect(chess.turn()).toBe(WHITE);
    expect(gameStatusFromChess(chess)).toBe(GameStatus.CHECKMATE_WHITE);
  });

  it("detects stalemate", () => {
    const chess = new Chess("k7/8/1Q6/8/8/8/8/1K6 b - - 0 1");
    expect(chess.isStalemate()).toBe(true);
    expect(gameStatusFromChess(chess)).toBe(GameStatus.STALEMATE);
  });

  it("detects insufficient material", () => {
    const chess = new Chess("7k/8/8/8/8/8/8/6BK w - - 0 1");
    expect(chess.isInsufficientMaterial()).toBe(true);
    expect(gameStatusFromChess(chess)).toBe(GameStatus.INSUFFICIENT_MATERIAL);
  });
});

describe("squareFileAndRank", () => {
  it("maps e4 to file index 4 and rank 4", () => {
    expect(squareFileAndRank("e4")).toEqual({ fileIndex: 4, rankNumber: 4 });
  });

  it("maps a1 to origin", () => {
    expect(squareFileAndRank("a1")).toEqual({ fileIndex: 0, rankNumber: 1 });
  });
});

describe("squaresInDisplayOrder", () => {
  it("returns 64 squares for white view starting at a8", () => {
    const sq = squaresInDisplayOrder(Colors.WHITE);
    expect(sq).toHaveLength(64);
    expect(sq[0]).toBe("a8");
    expect(sq[63]).toBe("h1");
  });

  it("returns 64 squares for black view starting at h1", () => {
    const sq = squaresInDisplayOrder(Colors.BLACK);
    expect(sq).toHaveLength(64);
    expect(sq[0]).toBe("h1");
    expect(sq[63]).toBe("a8");
  });
});

describe("capturedDisplayFromMove", () => {
  it("returns null when no piece is taken", () => {
    const chess = new Chess();
    const move = chess.move({ from: "e2", to: "e4" });
    expect(move).not.toBeNull();
    if (!move) return;
    expect(capturedDisplayFromMove(move, "x")).toBeNull();
  });

  it("returns display row when a piece is captured", () => {
    const chess = new Chess();
    chess.move({ from: "e2", to: "e4" });
    chess.move({ from: "d7", to: "d5" });
    const capture = chess.move({ from: "e4", to: "d5" });
    expect(capture).not.toBeNull();
    if (!capture) return;
    const row = capturedDisplayFromMove(capture, "cap-1");
    expect(row).not.toBeNull();
    expect(row?.key).toBe("cap-1");
    expect(row?.label).toMatch(/^B /);
  });
});
