export class Sudoku {
  constructor(grid) {
    this.grid = JSON.parse(JSON.stringify(grid));
  }

  getGrid() {
    return JSON.parse(JSON.stringify(this.grid));
  }

  guess(move) {
    const { row, col, value } = move;
    if (row >= 0 && row < 9 && col >= 0 && col < 9) {
      this.grid[row][col] = value;
    }
  }

  clone() {
    return new Sudoku(this.getGrid());
  }

  toJSON() {
    return { grid: this.getGrid() };
  }

  // 校验单个单元格是否有效
  isCellValid(row, col) {
    const value = this.grid[row][col];
    if (!value) return true;

    for (let c = 0; c < 9; c++) {
      if (c !== col && this.grid[row][c] === value) return false;
    }
    for (let r = 0; r < 9; r++) {
      if (r !== row && this.grid[r][col] === value) return false;
    }

    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let r = boxRow; r < boxRow + 3; r++) {
      for (let c = boxCol; c < boxCol + 3; c++) {
        if ((r !== row || c !== col) && this.grid[r][c] === value) return false;
      }
    }

    return true;
  }

  // 获取所有无效单元格坐标
  getInvalidCells() {
    const invalids = [];
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (!this.isCellValid(row, col)) {
          invalids.push([row, col]);
        }
      }
    }
    return invalids;
  }

  // 获取某个空格的候选数集合
  getCandidates(row, col) {
    if (this.grid[row][col] !== 0) return [];

    const candidates = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]);

    for (let c = 0; c < 9; c++) {
      candidates.delete(this.grid[row][c]);
    }
    for (let r = 0; r < 9; r++) {
      candidates.delete(this.grid[r][col]);
    }

    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let r = boxRow; r < boxRow + 3; r++) {
      for (let c = boxCol; c < boxCol + 3; c++) {
        candidates.delete(this.grid[r][c]);
      }
    }

    return Array.from(candidates);
  }

  // 获取下一步提示：找到候选数唯一的格子
  getNextHint() {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (this.grid[row][col] === 0) {
          const candidates = this.getCandidates(row, col);
          if (candidates.length === 1) {
            return { row, col, value: candidates[0], candidates };
          }
        }
      }
    }
    return null;
  }

  toString() {
    return this.grid
      .map((row, idx) => {
        const prefix = idx % 3 === 0 && idx !== 0 ? '-------------------\n' : '';
        const rowStr = row
          .map((cell, i) => (i % 3 === 0 && i !== 0 ? `| ${cell}` : cell))
          .join(' ');
        return prefix + rowStr;
      })
      .join('\n');
  }
}

export function createSudokuFromJSON(json) {
  return new Sudoku(json.grid);
}