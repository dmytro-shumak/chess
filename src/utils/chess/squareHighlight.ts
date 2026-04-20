import type { Square } from "chess.js";
import type { SquareHighlight } from "../../types/chess/squareHighlight";

export function highlightRoleOnSquare(
  square: Square,
  highlight: SquareHighlight | null,
): "from" | "to" | null {
  if (highlight === null) return null;
  if (square === highlight.from) return "from";
  if (square === highlight.to) return "to";
  return null;
}
