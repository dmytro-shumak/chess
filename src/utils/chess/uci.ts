import type { Square } from "chess.js";
import { BISHOP, KNIGHT, QUEEN, ROOK } from "chess.js";
import { BOARD_FILES } from "../../constants/chess/boardFiles";
import type { PromotionChoice } from "../../types/chess/promotion";

const RANK_CHARS = "12345678";

export function parseUci(
  uci: string,
): { from: Square; to: Square; promotion?: PromotionChoice } | null {
  const normalized = uci.trim().toLowerCase();
  if (normalized.length !== 4 && normalized.length !== 5) return null;

  const fromToken = normalized.slice(0, 2);
  const toToken = normalized.slice(2, 4);
  if (!isSquareToken(fromToken) || !isSquareToken(toToken)) return null;

  const from = fromToken as Square;
  const to = toToken as Square;

  if (normalized.length === 4) return { from, to };

  const promotionLetter = normalized.charAt(4);
  if (!isPromotionLetter(promotionLetter)) return null;
  return { from, to, promotion: promotionLetter };
}

function isSquareToken(twoChars: string): boolean {
  if (twoChars.length !== 2) return false;
  const file = twoChars.charAt(0);
  const rank = twoChars.charAt(1);

  return (BOARD_FILES as string).includes(file) && RANK_CHARS.includes(rank);
}

function isPromotionLetter(char: string): char is PromotionChoice {
  return char === QUEEN || char === ROOK || char === BISHOP || char === KNIGHT;
}
