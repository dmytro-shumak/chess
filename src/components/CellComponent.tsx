import { Cell } from "../models/Cell";

interface CellProps {
  cell: Cell;
  selected: boolean;
  selectFigure: (cell: Cell) => void;
}

function CellComponent({ cell, selected, selectFigure }: CellProps) {
  return (
    <div
      className={["cell", cell.color, selected ? "selected" : ""].join(" ")}
      onClick={() => selectFigure(cell)}
      style={{ background: cell.available && cell.figure ? "green" : "" }}
    >
      {cell.available && !cell.figure && <div className="available"></div>}
      {cell.figure?.logo && <img src={cell.figure.logo} alt={cell.figure.name} />}
    </div>
  );
}

export default CellComponent;
