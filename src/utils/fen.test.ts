import { describe, it, expect } from "vitest";
import { Board } from "../models/Board";
import { Colors } from "../models/Colors";
import { FigureNames } from "../models/figures/Figure";
import { applyUciMove, boardToFen } from "./fen";

function freshBoard(): Board {
  const b = new Board();
  b.initCells();
  b.addFigures();
  return b;
}

describe("boardToFen", () => {
  it("matches standard start position", () => {
    const b = freshBoard();
    expect(boardToFen(b, Colors.WHITE, 1)).toBe(
      "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    );
  });

  it("after 1.e4 includes ep target and side to move black", () => {
    const b = freshBoard();
    expect(applyUciMove(b, "e2e4", Colors.WHITE)).toBe(true);
    expect(boardToFen(b, Colors.BLACK, 1)).toBe(
      "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
    );
  });
});

describe("applyUciMove", () => {
  it("applies black reply and updates fullmove in FEN", () => {
    const b = freshBoard();
    expect(applyUciMove(b, "e2e4", Colors.WHITE)).toBe(true);
    expect(applyUciMove(b, "e7e5", Colors.BLACK)).toBe(true);
    expect(boardToFen(b, Colors.WHITE, 2)).toBe(
      "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2",
    );
  });

  it("rejects mover color mismatch", () => {
    const b = freshBoard();
    expect(applyUciMove(b, "e2e4", Colors.BLACK)).toBe(false);
  });

  it("rejects invalid UCI", () => {
    const b = freshBoard();
    expect(applyUciMove(b, "z9z9", Colors.WHITE)).toBe(false);
  });

  it("applies white kingside castling", () => {
    const b = freshBoard();
    for (const [uci, color] of [
      ["e2e4", Colors.WHITE],
      ["e7e5", Colors.BLACK],
      ["g1f3", Colors.WHITE],
      ["g8f6", Colors.BLACK],
      ["f1c4", Colors.WHITE],
      ["b8c6", Colors.BLACK],
      ["e1g1", Colors.WHITE],
    ] as const) {
      expect(applyUciMove(b, uci, color)).toBe(true);
    }
    expect(b.getCell(6, 7).figure?.name).toBe(FigureNames.KING);
    expect(b.getCell(5, 7).figure?.name).toBe(FigureNames.ROOK);
    expect(boardToFen(b, Colors.BLACK, 4)).toMatch(/ b kq /);
  });
});
