export enum GameStatus {
  ACTIVE = 'active',
  CHECKMATE_WHITE = 'checkmate_white',
  CHECKMATE_BLACK = 'checkmate_black',
  STALEMATE = 'stalemate',
  THREEFOLD_REPETITION = 'threefold_repetition',
  FIFTY_MOVE_DRAW = 'fifty_move_draw',
  TIMEOUT_WHITE = 'timeout_white',
  TIMEOUT_BLACK = 'timeout_black',
  INSUFFICIENT_MATERIAL = 'insufficient_material',
}