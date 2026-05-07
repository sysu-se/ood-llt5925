import { Sudoku, createSudokuFromJSON } from './Sudoku.js';
import { Game, createGameFromJSON } from './Game.js';
import { ExploreSession } from './ExploreSession.js';

export function createSudoku(input) {
  return new Sudoku(input);
}

export { createSudokuFromJSON };

export function createGame({ sudoku }) {
  return new Game({ sudoku });
}

export { createGameFromJSON };
export { ExploreSession };
export { Sudoku, Game };