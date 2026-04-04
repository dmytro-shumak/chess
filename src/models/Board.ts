import { Rook } from "./figures/Rook";
import { Knight } from "./figures/Knight";
import { Bishop } from "./figures/Bishop";
import { King } from "./figures/King";
import { Cell } from "./Cell";
import { Colors } from "./Colors";
import { Pawn } from "./figures/Pawn";
import { Queen } from "./figures/Queen";
import { Figure, FigureNames } from "./figures/Figure";

// FIDE: 100 half-moves without pawn move or capture = 50 full moves → draw.
export const FIFTY_MOVE_HALF_MOVE_LIMIT = 100;

export class Board {
  cells: Cell[][] = [];
  lostBlackFigures: Figure[] = [];
  lostWhiteFigures: Figure[] = [];
  enPassantTarget: Cell | null = null;
  // Pawn reached last rank; promotion UI must run before the next move.
  pendingPromotion: { x: number; y: number } | null = null;
  // Half-moves since last pawn move or capture; used for 50-move rule.
  halfMoveClock = 0;

  recordHalfMoveAfterPly(pawnMove: boolean, capture: boolean): void {
    if (pawnMove || capture) {
      this.halfMoveClock = 0;
    } else {
      this.halfMoveClock += 1;
    }
  }

  public initCells() {
    for (let i = 0; i < 8; i++) {
      const row: Cell[] = [];
      for (let j = 0; j < 8; j++) {
        if ((i + j) % 2 !== 0) {
          row.push(new Cell(this, j, i, Colors.BLACK, null)); // black cell
        } else {
          row.push(new Cell(this, j, i, Colors.WHITE, null)); // white cell
        }
      }
      this.cells.push(row);
    }
  }

  public hightlightCells(selectedCell: Cell | null, currentPlayerColor: Colors | null) {
    for (let i = 0; i < this.cells.length; i++) {
      const row = this.cells[i];
      for (let j = 0; j < row.length; j++) {
        const target = row[j];
        target.available = selectedCell
          ? this.canMoveConsideringCheck(selectedCell, target, currentPlayerColor)
          : false;
      }
    }
  }

  public canMoveConsideringCheck(source: Cell, target: Cell, currentPlayerColor: Colors | null): boolean {
    if (!source.figure) return false;
    if (currentPlayerColor === null) return false;
    if (source.figure.color !== currentPlayerColor) return false;
    if (!source.figure.canMove(target)) return false;

    const originalTargetFigure = target.figure;
    const originalSourceFigure = source.figure;

    // simulate move
    target.figure = source.figure;
    source.figure = null;
    if (target.figure) target.figure.cell = target;

    const kingSafe = !this.isKingInCheck(currentPlayerColor);

    // revert
    source.figure = originalSourceFigure;
    target.figure = originalTargetFigure;
    if (originalSourceFigure) originalSourceFigure.cell = source;
    if (originalTargetFigure) originalTargetFigure.cell = target;

    return kingSafe;
  }

  public getCopyBoard(): Board {
    const newBoard = new Board();
    newBoard.cells = this.cells;
    newBoard.lostBlackFigures = this.lostBlackFigures;
    newBoard.lostWhiteFigures = this.lostWhiteFigures;
    newBoard.enPassantTarget = this.enPassantTarget;
    newBoard.pendingPromotion = this.pendingPromotion;
    newBoard.halfMoveClock = this.halfMoveClock;
    for (const row of this.cells) {
      for (const cell of row) {
        cell.board = newBoard;
      }
    }
    return newBoard;
  }

  public completePromotion(piece: FigureNames.QUEEN | FigureNames.ROOK | FigureNames.BISHOP | FigureNames.KNIGHT): void {
    if (!this.pendingPromotion) return;
    const cell = this.getCell(this.pendingPromotion.x, this.pendingPromotion.y);
    const pawn = cell.figure;
    if (!(pawn instanceof Pawn)) {
      this.pendingPromotion = null;
      return;
    }
    const color = pawn.color;
    cell.figure = null;
    this.pendingPromotion = null;
    switch (piece) {
      case FigureNames.QUEEN:
        new Queen(color, cell);
        break;
      case FigureNames.ROOK:
        new Rook(color, cell);
        break;
      case FigureNames.BISHOP:
        new Bishop(color, cell);
        break;
      case FigureNames.KNIGHT:
        new Knight(color, cell);
        break;
      default:
        break;
    }
  }

  public getCell(x: number, y: number) {
    return this.cells[y][x];
  }

  private addPawns() {
    for (let i = 0; i < 8; i++) {
      new Pawn(Colors.BLACK, this.getCell(i, 1));
      new Pawn(Colors.WHITE, this.getCell(i, 6));
    }
  }
  private addKings() {
    new King(Colors.BLACK, this.getCell(4, 0));
    new King(Colors.WHITE, this.getCell(4, 7));
  }
  private addQuens() {
    new Queen(Colors.BLACK, this.getCell(3, 0));
    new Queen(Colors.WHITE, this.getCell(3, 7));
  }
  private addBishops() {
    for (let i = 0; i < 2; i++) {
      new Bishop(Colors.BLACK, this.getCell(i * 3 + 2, 0));
      new Bishop(Colors.WHITE, this.getCell(i * 3 + 2, 7));
    }
  }
  private addKnights() {
    for (let i = 0; i < 2; i++) {
      new Knight(Colors.BLACK, this.getCell(i * 5 + 1, 0));
      new Knight(Colors.WHITE, this.getCell(i * 5 + 1, 7));
    }
  }
  private addRooks() {
    for (let i = 0; i < 2; i++) {
      new Rook(Colors.BLACK, this.getCell(i * 7, 0));
      new Rook(Colors.WHITE, this.getCell(i * 7, 7));
    }
  }

  public addFigures() {
    this.addPawns();
    this.addKings();
    this.addQuens();
    this.addBishops();
    this.addKnights();
    this.addRooks();
  }

  public getAttackers(target: Cell, color: Colors) {
    const attackers = [] as Figure[];
    for (let i = 0; i < this.cells.length; i++) {
      const row = this.cells[i];
      for (let j = 0; j < row.length; j++) {
        const cell = row[j];
        if (cell.figure && cell.figure.color !== color) {
          if (cell.figure.canAttack(target)) {
            attackers.push(cell.figure);
          }
        }
      }
    }
    return attackers;
  }

  public isUnderAttack(target: Cell, color: Colors): boolean {
    return this.getAttackers(target, color).length > 0;
  }

  public isKingInCheck(color: Colors): boolean {
    const king = this.findKing(color);
    if (!king) return false;
    return this.isUnderAttack(king.cell, color);
  }

  public isCheckmate(color: Colors): boolean {
    if (!this.isKingInCheck(color)) return false;
    return !this.hasValidMoves(color);
  }

  public isStalemate(color: Colors): boolean {
    if (this.isKingInCheck(color)) return false;
    return !this.hasValidMoves(color);
  }

  private hasValidMoves(color: Colors): boolean {
    for (let i = 0; i < this.cells.length; i++) {
      const row = this.cells[i];
      for (let j = 0; j < row.length; j++) {
        const cell = row[j];
        if (cell.figure && cell.figure.color === color) {
          for (let x = 0; x < 8; x++) {
            for (let y = 0; y < 8; y++) {
              const target = this.getCell(x, y);
              if (cell.figure?.canMove(target)) {
                // Simulate move
                const originalFigure: Figure | null = target.figure;
                const originalCellFigure: Figure | null = cell.figure;
                target.figure = cell.figure;
                cell.figure = null;
                if (target.figure) target.figure.cell = target;
                const kingInCheck = this.isKingInCheck(color);
                // Revert
                cell.figure = originalCellFigure;
                target.figure = originalFigure;
                if (originalCellFigure) originalCellFigure.cell = cell;
                if (!kingInCheck) return true;
              }
            }
          }
        }
      }
    }
    return false;
  }

  public getKingCell(color: Colors): Cell | null {
    const king = this.findKing(color);
    return king?.cell ?? null;
  }

  private findKing(color: Colors): Figure | null {
    for (let i = 0; i < this.cells.length; i++) {
      const row = this.cells[i];
      for (let j = 0; j < row.length; j++) {
        const cell = row[j];
        if (cell.figure && cell.figure.name === FigureNames.KING && cell.figure.color === color) {
          return cell.figure;
        }
      }
    }
    return null;
  }
}
