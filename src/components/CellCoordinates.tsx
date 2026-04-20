import { classNames } from "../utils/classNames";

const labelBase = "pointer-events-none absolute z-10 select-none text-sm font-bold leading-none";

interface CellCoordinatesProps {
  rankLabel: string | null;
  fileLabel: string | null;
  labelTextClassName: string;
}

function CellCoordinates({ rankLabel, fileLabel, labelTextClassName }: CellCoordinatesProps) {
  return (
    <>
      {rankLabel && (
        <span className={classNames(labelBase, "left-0.5 top-0.5", labelTextClassName)} aria-hidden>
          {rankLabel}
        </span>
      )}
      {fileLabel && (
        <span
          className={classNames(labelBase, "bottom-0.5 right-0.5", labelTextClassName)}
          aria-hidden
        >
          {fileLabel}
        </span>
      )}
    </>
  );
}

export default CellCoordinates;
