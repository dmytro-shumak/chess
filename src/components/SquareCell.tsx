import type { SvgComponent } from "../types/svg";
import { classNames } from "../utils/classNames";
import CellCoordinates from "./CellCoordinates";

export interface SquareCellProps {
  fileIndex: number;
  rankNumber: number;
  isLightSquare: boolean;
  Logo: SvgComponent | null;
  selected: boolean;
  kingInCheck: boolean;
  lastMoveRole: "from" | "to" | null;
  showMoveHint: boolean;
  isCaptureHint: boolean;
  onClick: () => void;
}

function SquareCell({
  fileIndex,
  rankNumber,
  isLightSquare,
  Logo,
  selected,
  kingInCheck,
  lastMoveRole,
  showMoveHint,
  isCaptureHint,
  onClick,
}: SquareCellProps) {
  const lastMoveHighlight = lastMoveRole !== null;
  const rankLabel = fileIndex === 0 ? String(rankNumber) : null;
  const fileLabel = rankNumber === 1 ? String.fromCharCode(97 + fileIndex) : null;
  const labelTextClassName = isLightSquare === false ? "text-chess-light" : "text-chess-dark";

  return (
    <div
      className={classNames(
        "relative flex h-20 w-20 cursor-pointer items-center justify-center border border-black/10",
        {
          "bg-chess-light": isLightSquare && !selected,
          "bg-chess-dark": !isLightSquare && !selected,
          "bg-chess-selected": selected,
          "z-2 ring-2 ring-inset ring-red-600/90": kingInCheck,
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
