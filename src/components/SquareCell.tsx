import type { Chess, Square } from "chess.js";
import { Colors } from "../constants/chess/colors";
import type { SquareHighlight } from "../types/chess/squareHighlight";
import { pieceLogo } from "../utils/chess/pieceGlyphs";
import { squareFileAndRank } from "../utils/chess/squareCoords";
import { highlightRoleOnSquare } from "../utils/chess/squareHighlight";
import { classNames } from "../utils/classNames";
import CellCoordinates from "./CellCoordinates";

export interface SquareCellProps {
  square: Square;
  chess: Chess;
  viewFromColor: Colors;
  selectedSquare: Square | null;
  legalTargets: ReadonlySet<Square>;
  checkSquare: Square | null;
  lastMove: SquareHighlight | null;
  onClick: () => void;
}

function SquareCell({
  square,
  chess,
  viewFromColor,
  selectedSquare,
  legalTargets,
  checkSquare,
  lastMove,
  onClick,
}: SquareCellProps) {
  const piece = chess.get(square);
  const Logo = piece ? pieceLogo(piece.type, piece.color) : null;
  const { fileIndex, rankNumber } = squareFileAndRank(square);
  const isLightSquare = chess.squareColor(square) === "light";
  const selected = square === selectedSquare;
  const showMoveHint = legalTargets.has(square);
  const isCaptureHint = showMoveHint && piece !== undefined;
  const moveHighlightRole = highlightRoleOnSquare(square, lastMove);

  const lastMoveHighlight = moveHighlightRole !== null;

  const isWhiteView = viewFromColor === Colors.WHITE;
  const showRankOnLeft = isWhiteView ? fileIndex === 0 : fileIndex === 7;
  const showFileOnBottom = isWhiteView ? rankNumber === 1 : rankNumber === 8;

  const rankLabel = showRankOnLeft ? String(rankNumber) : null;
  const fileLabel = showFileOnBottom ? square.charAt(0) : null;
  const labelTextClassName = isLightSquare === false ? "text-chess-light" : "text-chess-dark";

  return (
    <div
      className={classNames(
        "relative flex h-20 w-20 cursor-pointer items-center justify-center border border-black/10",
        {
          "bg-chess-light": isLightSquare && !selected,
          "bg-chess-dark": !isLightSquare && !selected,
          "bg-chess-selected": selected,
          "z-2 ring-2 ring-inset ring-red-600/90": checkSquare !== null && square === checkSquare,
          "ring-2 ring-inset ring-amber-400/70": lastMoveHighlight && selected,
        },
      )}
      onClick={onClick}
    >
      {lastMoveHighlight && !selected && (
        <span className="pointer-events-none absolute inset-0 z-0 bg-amber-300/50" aria-hidden />
      )}
      <CellCoordinates
        rankLabel={rankLabel}
        fileLabel={fileLabel}
        labelTextClassName={labelTextClassName}
      />
      {showMoveHint && (
        <span
          className={classNames(
            "pointer-events-none absolute left-1/2 top-1/2 z-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-500 shadow-sm",
            isCaptureHint ? "h-10 w-10 opacity-50" : "h-5 w-5",
          )}
          aria-hidden
        />
      )}
      {Logo && <Logo className="relative z-2" width="100%" height="100%" />}
    </div>
  );
}

export default SquareCell;
