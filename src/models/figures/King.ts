import { Cell } from "./../Cell";
import { Colors } from "./../Colors";
import { Figure, FigureNames } from "./Figure";
import { Rook } from "./Rook";
import blackLogo from "../../assets/black-king.png";
import whiteLogo from "../../assets/white-king.png";
export class King extends Figure {
  constructor(color: Colors, cell: Cell) {
    super(color, cell);
    this.logo = color === Colors.BLACK ? blackLogo : whiteLogo;
    this.name = FigureNames.KING;
  }
  canMove(target: Cell): boolean {
    if (!super.canMove(target)) return false;
    const dx = Math.abs(this.cell.x - target.x);
    const dy = Math.abs(this.cell.y - target.y);

    // Normal king moves
    if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1) || (dx === 1 && dy === 1)) {
      return true;
    }

    // Castling
    if (dy === 0 && dx === 2 && this.isFirstMove) {
      const direction = target.x > this.cell.x ? 1 : -1; // 1 for kingside, -1 for queenside
      const rookX = direction === 1 ? 7 : 0;
      const rookCell = this.cell.board.getCell(rookX, this.cell.y);

      console.log(
        "King.castling check",
        JSON.stringify({
          king: { x: this.cell.x, y: this.cell.y, isFirstMove: this.isFirstMove },
          target: { x: target.x, y: target.y },
          rookCell: { x: rookX, y: this.cell.y, figure: rookCell.figure?.name },
        })
      );

      if (!(rookCell.figure instanceof Rook)) {
        console.log("Castling blocked: rook missing or wrong", rookCell.figure);
        return false;
      }
      if (!rookCell.figure.isFirstMove) {
        console.log("Castling blocked: rook already moved");
        return false;
      }
      if (rookCell.figure.color !== this.color) {
        console.log("Castling blocked: rook color differs");
        return false;
      }

      // Check if path is clear
      const startX = Math.min(this.cell.x, rookX) + 1;
      const endX = Math.max(this.cell.x, rookX);
      for (let x = startX; x < endX; x++) {
        if (!this.cell.board.getCell(x, this.cell.y).isEmpty()) {
          console.log("Castling blocked: path is not clear", { x });
          return false;
        }
      }
      // Check if king is in check
      if (this.cell.board.isKingInCheck(this.color)) {
        console.log("Castling blocked: king in check");
        return false;
      }
      // Check if squares king passes through are under attack
      const kingPathX = direction === 1 ? [this.cell.x + 1, this.cell.x + 2] : [this.cell.x - 1, this.cell.x - 2];
      for (const x of kingPathX) {
        const field = this.cell.board.getCell(x, this.cell.y);
        const attackers = this.cell.board.getAttackers(field, this.color);
        if (attackers.length > 0) {
          console.log(
            "Castling blocked: square under attack",
            JSON.stringify({
              x,
              field: [x, this.cell.y],
              attackers: attackers.map((a) => ({
                name: a.name,
                color: a.color,
                x: a.cell.x,
                y: a.cell.y,
              })),
            })
          );
          return false;
        }
      }
      console.log("Castling allowed");
      return true;
    }

    return false;
  }

  moveFigure(target: Cell) {
    super.moveFigure(target);
    // Handle castling
    const dx = Math.abs(this.cell.x - target.x);
    if (dx === 2) {
      const direction = target.x > this.cell.x ? 1 : -1;
      const rookX = direction === 1 ? 7 : 0;
      const newRookX = direction === 1 ? 5 : 3;
      const rookCell = this.cell.board.getCell(rookX, this.cell.y);
      const newRookCell = this.cell.board.getCell(newRookX, this.cell.y);
      if (rookCell.figure instanceof Rook) {
        rookCell.figure.moveFigure(newRookCell);
        newRookCell.figure = rookCell.figure;
        rookCell.figure.cell = newRookCell;
        rookCell.figure = null;
      }
    }
  }
}
