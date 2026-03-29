import { Cell } from "../models/Cell";
import { Colors } from "../models/Colors";
import { classNames } from "../utils/classNames";

interface CellProps {
  cell: Cell;
  selected: boolean;
  selectFigure: (cell: Cell) => void;
}

function CellComponent({ cell, selected, selectFigure }: CellProps) {
  const showMoveHint = cell.available && !selected;
  const isCaptureHint = showMoveHint && Boolean(cell.figure);
  const Logo = cell.figure?.Logo;

  return (
    <div
      className={classNames(
        "relative flex h-20 w-20 cursor-pointer items-center justify-center border border-black/10",
        {
          "bg-chess-light": cell.color === Colors.WHITE && !selected,
          "bg-chess-dark": cell.color === Colors.BLACK && !selected,
          "bg-chess-selected": selected,
        },
      )}
      onClick={() => selectFigure(cell)}
    >
      {showMoveHint && (
        <span
          className={classNames(
            "pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-500 shadow-sm",
            isCaptureHint ? "z-0 h-10 w-10 opacity-50" : "z-1 h-5 w-5",
          )}
          aria-hidden
        />
      )}
      {Logo && <Logo width="75%" height="75%" />}
    </div>
  );
}

export default CellComponent;
