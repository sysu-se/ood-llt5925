import { writable, derived, get } from 'svelte/store';
import { createGame, createSudoku } from '../domain/index.js';

const DEFAULT_INITIAL_GRID = [
  [5, 3, 0, 0, 7, 0, 0, 0, 0],
  [6, 0, 0, 1, 9, 5, 0, 0, 0],
  [0, 9, 8, 0, 0, 0, 0, 6, 0],
  [8, 0, 0, 0, 6, 0, 0, 0, 3],
  [4, 0, 0, 8, 0, 3, 0, 0, 1],
  [7, 0, 0, 0, 2, 0, 0, 0, 6],
  [0, 6, 0, 0, 0, 0, 2, 8, 0],
  [0, 0, 0, 4, 1, 9, 0, 0, 5],
  [0, 0, 0, 0, 8, 0, 0, 7, 9]
];

export function createGameStore(initialGrid = DEFAULT_INITIAL_GRID) {
  const sudoku = createSudoku(initialGrid);
  let game = createGame({ sudoku });

  const grid = writable(game.getSudoku().getGrid());
  const initialGameGrid = writable(initialGrid.map(row => [...row]));
  const canUndo = writable(game.canUndo());
  const canRedo = writable(game.canRedo());
  const selectedCell = writable(null);
  const gamePaused = writable(false);
  const hintMessage = writable(null);

  // Explore
  const isExploring = writable(false);
  const exploreGrid = writable(null);
  const exploreCanUndo = writable(false);
  const exploreCanRedo = writable(false);
  const exploreConflicting = writable(false);
  const exploreFailedPath = writable(false);

  const invalidCells = derived(grid, ($grid) => {
    const tempSudoku = createSudoku($grid);
    return tempSudoku.getInvalidCells();
  });

  const gameWon = derived(grid, ($grid) => {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if ($grid[row][col] === 0) return false;
      }
    }
    const tempSudoku = createSudoku($grid);
    return tempSudoku.getInvalidCells().length === 0;
  });

  function guess(move) {
    game.guess(move);
    syncToStore();
    hintMessage.set(null);
  }

  function undo() {
    if (!game.canUndo()) return;
    game.undo();
    syncToStore();
    hintMessage.set(null);
  }

  function redo() {
    if (!game.canRedo()) return;
    game.redo();
    syncToStore();
    hintMessage.set(null);
  }

  function newGame(newGrid) {
    const gridToUse = (newGrid && Array.isArray(newGrid) && newGrid.length === 9) ? newGrid : DEFAULT_INITIAL_GRID;
    const sudoku = createSudoku(gridToUse);
    game = createGame({ sudoku });
    initialGameGrid.set(gridToUse.map(row => [...row]));
    syncToStore();
    selectedCell.set(null);
    hintMessage.set(null);
    isExploring.set(false);
    exploreGrid.set(null);
  }

  function selectCell(row, col) {
    selectedCell.set({ row, col });
  }

  function pauseGame() {
    gamePaused.set(true);
  }

  function resumeGame() {
    gamePaused.set(false);
  }

  // function getHint() {
  //   const hint = game.getHint();
  //   if (hint) {
  //     game.guess({ row: hint.row, col: hint.col, value: hint.value });
  //     syncToStore();
  //     selectedCell.set({ row: hint.row, col: hint.col });
  //     hintMessage.set({ message: `已在第 ${hint.row + 1} 行第 ${hint.col + 1} 列自动填入 ${hint.value}` });
  //     return;
  //   }
  //   const cell = get(selectedCell);
  //   if (cell) {
  //     const { row, col } = cell;
  //     const currentGrid = game.getSudoku().getGrid();
  //     if (currentGrid[row][col] === 0) {
  //       const candidates = game.getCandidates(row, col);
  //       hintMessage.set({ message: `第 ${row + 1} 行第 ${col + 1} 列候选数：[${candidates.join(', ')}]` });
  //       return;
  //     }
  //   }
  //   hintMessage.set({ message: '请先点击选中一个空格' });
  // }
  function getHint() {
    const cell = get(selectedCell);
    console.log('getHint - cell:', cell);

    // 1. 优先：如果用户选中了空格，显示该格候选数
    if (cell) {
        const { row, col } = cell;
        const currentGrid = game.getSudoku().getGrid();
        console.log('getHint - currentGrid[row][col]:', currentGrid[row][col]);
        if (currentGrid[row][col] === 0) {
            const candidates = game.getCandidates(row, col);
            if (candidates.length === 1) {
                hintMessage.set({ message: `第 ${row + 1} 行第 ${col + 1} 列候选数唯一：[${candidates[0]}]，已自动填入` });
                game.guess({ row, col, value: candidates[0] });
                syncToStore();
            } else {
                hintMessage.set({ message: `第 ${row + 1} 行第 ${col + 1} 列候选数：[${candidates.join(', ')}]（共 ${candidates.length} 个）` });
            }
            return;
        }
    }

    // 2. 未选中格子：找全局唯一候选数并自动填入
    const hint = game.getHint();
    if (hint) {
        game.guess({ row: hint.row, col: hint.col, value: hint.value });
        syncToStore();
        selectedCell.set({ row: hint.row, col: hint.col });
        hintMessage.set({ message: `已在第 ${hint.row + 1} 行第 ${hint.col + 1} 列自动填入 ${hint.value}` });
        return;
    }

    // 3. 既没选中也没唯一候选数
    hintMessage.set({ message: '请先点击选中一个空格，查看候选数' });
}

  // ============ Explore ============

function startExplore() {
    // 用 store 里的当前棋盘同步到 game.currentSudoku
    const currentGrid = get(grid);
    game.currentSudoku = createSudoku(currentGrid.map(row => [...row]));

    game.startExplore();
    const session = game.getExploreSession();
    console.log('startExplore - session grid:', session.getGrid());
    //isExploring.set(true);
    exploreGrid.set(session.getGrid());
    isExploring.set(true);
    exploreCanUndo.set(false);
    exploreCanRedo.set(false);
    exploreConflicting.set(false);
    exploreFailedPath.set(false);
    hintMessage.set(null);
}

  function commitExplore() {
    game.endExplore(true);
    isExploring.set(false);
    exploreGrid.set(null);
    syncToStore();
  }

  function abortExplore() {
    game.endExplore(false);
    isExploring.set(false);
    exploreGrid.set(null);
  }

  function exploreGuess(move) {
    const session = game.getExploreSession();
    if (!session) return;
    console.log('exploreGuess before:', session.getGrid());
    session.guess(move);
    console.log('exploreGuess after:', session.getGrid());
    syncExploreState(session);
    console.log('exploreGrid store after sync:', get(exploreGrid));
}

  function exploreUndo() {
    const session = game.getExploreSession();
    if (!session) return;
    session.undo();
    syncExploreState(session);
  }

  function exploreRedo() {
    const session = game.getExploreSession();
    if (!session) return;
    session.redo();
    syncExploreState(session);
  }

  function syncExploreState(session) {
    exploreGrid.set(session.getGrid().map(row => [...row]));//exploreGrid.set(session.getGrid());
    exploreCanUndo.set(session.canUndo());
    exploreCanRedo.set(session.canRedo());
    exploreConflicting.set(session.isConflicting());
    exploreFailedPath.set(session.isFailedPath());
    if (session.isConflicting()) {
      session.markAsFailed();
    }
  }

  function syncToStore() {
    const newGrid = game.getSudoku().getGrid();
    grid.set(newGrid.map(row => [...row]));
    canUndo.set(game.canUndo());
    canRedo.set(game.canRedo());
  }

  return {
    grid: { subscribe: grid.subscribe },
    initialGameGrid: { subscribe: initialGameGrid.subscribe },
    canUndo: { subscribe: canUndo.subscribe },
    canRedo: { subscribe: canRedo.subscribe },
    selectedCell: { subscribe: selectedCell.subscribe },
    invalidCells: { subscribe: invalidCells.subscribe },
    gameWon: { subscribe: gameWon.subscribe },
    gamePaused: { subscribe: gamePaused.subscribe },
    hintMessage: { subscribe: hintMessage.subscribe },
    isExploring: { subscribe: isExploring.subscribe },
    exploreGrid: { subscribe: exploreGrid.subscribe },
    exploreCanUndo: { subscribe: exploreCanUndo.subscribe },
    exploreCanRedo: { subscribe: exploreCanRedo.subscribe },
    exploreConflicting: { subscribe: exploreConflicting.subscribe },
    exploreFailedPath: { subscribe: exploreFailedPath.subscribe },
    guess,
    undo,
    redo,
    newGame,
    selectCell,
    pauseGame,
    resumeGame,
    getHint,
    startExplore,
    commitExplore,
    abortExplore,
    exploreGuess,
    exploreUndo,
    exploreRedo
  };
}

export const gameStore = createGameStore();