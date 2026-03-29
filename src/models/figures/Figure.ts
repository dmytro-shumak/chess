import { Colors } from "../Colors";
import { Cell } from "../Cell";
import type { SvgComponent } from "../../types/svg";

export enum FigureNames {
  FIGURE = "Figure",
  KING = "King",
  KNIGHT = "Knight",
  PAWN = "Pawn",
  QUEEN = "Queen",
  ROOK = "Rook",
  BISHOP = "Bishop",
}
export abstract class Figure {
  Logo: SvgComponent | null;
  name: FigureNames;
  id: number;
  isFirstMove: boolean;
  constructor(public color: Colors, public cell: Cell) {
    this.cell.figure = this;
    this.Logo = null;
    this.name = FigureNames.FIGURE;
    this.id = Math.random();
    this.isFirstMove = true;
  }

  canMove(target: Cell): boolean {
    if (target.figure?.color === this.color) return false;
    return true;
  }

  canAttack(target: Cell): boolean {
    return this.canMove(target);
  }

  moveFigure(target: Cell) {
    this.isFirstMove = false;
  }
}
