export class ExploreSession {
  constructor(parentGame) {
    this.startSnapshot = parentGame.getSudoku().clone();
    this.parentGame = parentGame;
    this.exploreSudoku = this.startSnapshot.clone();
    this.history = [this.exploreSudoku.clone()];
    this.currentIndex = 0;
    this.failedPaths = new Set();
  }

  guess(move) {
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }
    this.exploreSudoku.guess(move);
    this.history.push(this.exploreSudoku.clone());
    this.currentIndex++;
  }

  undo() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.exploreSudoku = this.history[this.currentIndex].clone();
    }
  }

  redo() {
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++;
      this.exploreSudoku = this.history[this.currentIndex].clone();
    }
  }

  canUndo() {
    return this.currentIndex > 0;
  }

  canRedo() {
    return this.currentIndex < this.history.length - 1;
  }

  isConflicting() {
    return this.exploreSudoku.getInvalidCells().length > 0;
  }

  markAsFailed() {
    this.failedPaths.add(this.exploreSudoku.getGrid().flat().join(','));
  }

  isFailedPath() {
    return this.failedPaths.has(this.exploreSudoku.getGrid().flat().join(','));
  }

  commit() {
    const currentGrid = this.exploreSudoku.getGrid();
    const startGrid = this.startSnapshot.getGrid();
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (startGrid[row][col] === 0 && currentGrid[row][col] !== 0) {
          this.parentGame.guess({ row, col, value: currentGrid[row][col] });
        }
      }
    }
  }

  abort() {
    this.exploreSudoku = this.startSnapshot.clone();
    this.history = [this.exploreSudoku.clone()];
    this.currentIndex = 0;
  }

  reset() {
    this.exploreSudoku = this.startSnapshot.clone();
    this.history = [this.exploreSudoku.clone()];
    this.currentIndex = 0;
  }

  getGrid() {
    return this.exploreSudoku.getGrid();
  }

  getInvalidCells() {
    return this.exploreSudoku.getInvalidCells();
  }
}