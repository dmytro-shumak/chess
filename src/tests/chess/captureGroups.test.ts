import { describe, expect, it } from "vitest";
import type { CapturedDisplay } from "../../types/chess/capturedDisplay";
import type { SvgComponent } from "../../types/svg";
import {
  groupCapturedForDisplay,
  pieceWordFromCaptureLabel,
} from "../../utils/chess/groupCapturedForDisplay";

const DummyLogo = (() => null) as unknown as SvgComponent;

function capture(key: string, label: string): CapturedDisplay {
  return { key, Logo: DummyLogo, label };
}

describe("groupCapturedForDisplay", () => {
  it("returns empty array for no captures", () => {
    expect(groupCapturedForDisplay([])).toEqual([]);
  });

  it("merges rows that share the same label", () => {
    const grouped = groupCapturedForDisplay([
      capture("a", "B P"),
      capture("b", "B P"),
      capture("c", "W N"),
    ]);
    expect(grouped).toHaveLength(2);
    const pawns = grouped.find((g) => g.label === "B P");
    const knight = grouped.find((g) => g.label === "W N");
    expect([...(pawns?.keys ?? [])].sort()).toEqual(["a", "b"]);
    expect(knight?.keys).toEqual(["c"]);
  });
});

describe("pieceWordFromCaptureLabel", () => {
  it("maps piece letter from label to English word", () => {
    expect(pieceWordFromCaptureLabel("B Q")).toBe("Queen");
    expect(pieceWordFromCaptureLabel("W P")).toBe("Pawn");
  });

  it("returns empty string for unknown symbol", () => {
    expect(pieceWordFromCaptureLabel("B X")).toBe("");
  });
});
