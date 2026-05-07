import { createSudokuFromJSON } from './Sudoku.js';
import { ExploreSession } from './ExploreSession.js';

export class Game {
  constructor({ sudoku }) {
    this.currentSudoku = sudoku.clone();
    this.history = [this.currentSudoku.clone()];
    this.currentIndex = 0;
    this.exploreSession = null;
  }

  getSudoku() {
    return this.currentSudoku;
  }

  guess(move) {
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }
    this.currentSudoku.guess(move);
    this.history.push(this.currentSudoku.clone());
    this.currentIndex++;
  }

  undo() {
    if (!this.canUndo()) return;
    this.currentIndex--;
    this.currentSudoku = this.history[this.currentIndex].clone();
  }

  redo() {
    if (!this.canRedo()) return;
    this.currentIndex++;
    this.currentSudoku = this.history[this.currentIndex].clone();
  }

  canUndo() {
    return this.currentIndex > 0;
  }

  canRedo() {
    return this.currentIndex < this.history.length - 1;
  }

  getHint() {
    return this.currentSudoku.getNextHint();
  }

  getCandidates(row, col) {
    return this.currentSudoku.getCandidates(row, col);
  }

  // Explore
  startExplore() {
    this.exploreSession = new ExploreSession(this);
  }

  endExplore(commit = false) {
    if (!this.exploreSession) return;
    if (commit) {
      this.exploreSession.commit();
    }
    this.exploreSession = null;
  }

  getExploreSession() {
    return this.exploreSession;
  }

  isExploring() {
    return !!this.exploreSession;
  }

  toJSON() {
    return {
      currentSudoku: this.currentSudoku.toJSON(),
      history: this.history.map(s => s.toJSON()),
      currentIndex: this.currentIndex
    };
  }
}

export function createGameFromJSON(json) {
  const sudoku = createSudokuFromJSON(json.currentSudoku);
  const game = new Game({ sudoku });
  game.history = json.history.map(h => createSudokuFromJSON(h));
  game.currentIndex = json.currentIndex;
  game.currentSudoku = game.history[game.currentIndex].clone();
  return game;
}