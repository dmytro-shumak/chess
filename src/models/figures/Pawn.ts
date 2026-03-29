import { Cell } from "./../Cell";
import { Colors } from "./../Colors";
import { Figure, FigureNames } from "./Figure";
import { Queen } from "./Queen";
import blackLogo from "../../assets/pawn-dark.svg";
import whiteLogo from "../../assets/pawn-white.svg";
export class Pawn extends Figure {
  isFirstStep: boolean = true;
  constructor(color: Colors, cell: Cell) {
    super(color, cell);
    this.logo = color === Colors.BLACK ? blackLogo : whiteLogo;
    this.name = FigureNames.PAWN;
  }
  canMove(target: Cell): boolean {
    if (!super.canMove(target)) return false;
    const direction = this.cell.figure?.color === Colors.BLACK ? 1 : -1;
    const firstStepDirection = this.cell.figure?.color === Colors.BLACK ? 2 : -2;

    if (
      (target.y === this.cell.y + direction ||
        (this.isFirstStep &&
          target.y === this.cell.y + firstStepDirection &&
          this.cell.board.getCell(target.x, this.cell.y + direction).isEmpty())) &&
      target.x === this.cell.x &&
      this.cell.board.getCell(target.x, target.y).isEmpty()
    ) {
      return true;
    }
    // по диагонали если есть вражеская фигура
    if (
      target.y === this.cell.y + direction &&
      (target.x === this.cell.x + 1 || target.x === this.cell.x - 1) &&
      this.cell.isEnemy(target)
    ) {
      return true;
    }

    // en passant
    if (
      this.cell.board.enPassantTarget &&
      target === this.cell.board.enPassantTarget &&
      target.y === this.cell.y + direction &&
      (target.x === this.cell.x + 1 || target.x === this.cell.x - 1)
    ) {
      return true;
    }

    return false;
  }

  canAttack(target: Cell): boolean {
    const direction = this.color === Colors.BLACK ? 1 : -1;
    return (
      target.y === this.cell.y + direction &&
      (target.x === this.cell.x + 1 || target.x === this.cell.x - 1)
    );
  }

  moveFigure(target: Cell): void {
    super.moveFigure(target);
    this.isFirstStep = false;
  }

  promoteIfNeeded(): Figure | null {
    const promotionRank = this.color === Colors.WHITE ? 0 : 7;
    if (this.cell.y === promotionRank) {
      return new Queen(this.color, this.cell);
    }
    return null;
  }
}
