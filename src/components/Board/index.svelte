<script>
  import { gameStore } from '../../stores/gameStore.js';
  import Cell from './Cell.svelte';

  const grid = gameStore.grid;
  const initialGameGrid = gameStore.initialGameGrid;
  const selectedCell = gameStore.selectedCell;
  const invalidCells = gameStore.invalidCells;
  const gamePaused = gameStore.gamePaused;
  const hintMessage = gameStore.hintMessage;
  const isExploring = gameStore.isExploring;
  const exploreGrid = gameStore.exploreGrid;
  const exploreConflicting = gameStore.exploreConflicting;

  $: gridValue = $grid;
  $: initialGridValue = $initialGameGrid;
  $: selectedCellValue = $selectedCell;
  $: invalidCellsValue = $invalidCells;
  $: gamePausedValue = $gamePaused;
  $: hintMessageValue = $hintMessage;
  $: isExploringValue = $isExploring;
  $: exploreGridValue = $exploreGrid;
  $: exploreConflictingValue = $exploreConflicting;

  $: displayGrid = isExploringValue && exploreGridValue ? exploreGridValue : gridValue;
  $: console.log('isExploring:', isExploringValue, 'exploreGrid:', exploreGridValue, 'displayGrid:', displayGrid);

  $: invalidSet = new Set(invalidCellsValue.map(([r, c]) => `${c},${r}`));

  $: selectedValue = selectedCellValue ? displayGrid[selectedCellValue.row][selectedCellValue.col] : null;

  function isSelected(x, y) {
    return selectedCellValue && selectedCellValue.col === x && selectedCellValue.row === y;
  }

  function isSameArea(x, y) {
    if (!selectedCellValue) return false;
    const { row, col } = selectedCellValue;
    if (col === x || row === y) return true;
    const cursorBoxX = Math.floor(col / 3);
    const cursorBoxY = Math.floor(row / 3);
    const cellBoxX = Math.floor(x / 3);
    const cellBoxY = Math.floor(y / 3);
    return cursorBoxX === cellBoxX && cursorBoxY === cellBoxY;
  }

  function handleCellClick(y, x) {
    gameStore.selectCell(y, x);
  }
</script>

<div class="board-padding relative z-10">
  {#if isExploringValue}
    <div class="explore-banner">
      🧪 探索模式
      <button on:click={() => gameStore.commitExplore()}>提交</button>
      <button on:click={() => gameStore.abortExplore()}>放弃</button>
      {#if exploreConflictingValue}
        <span>⚠️ 冲突</span>
      {/if}
    </div>
  {/if}

  {#if hintMessageValue && !isExploringValue}
    <div class="hint-banner">{hintMessageValue.message}</div>
  {/if}

  <div class="max-w-xl relative">
    <div class="w-full" style="padding-top: 100%"></div>
  </div>
  <div class="board-padding absolute inset-0 flex justify-center">
    <div class="bg-white shadow-2xl rounded-xl overflow-hidden w-full h-full max-w-xl grid"
         class:bg-gray-200={gamePausedValue}
         class:bg-yellow-50={isExploringValue}>
      {#each displayGrid as row, y}
        {#each row as value, x}
          <Cell
            {value}
            cellY={y + 1}
            cellX={x + 1}
            disabled={gamePausedValue}
            
            selected={isSelected(x, y)}
            userNumber={initialGridValue[y][x] === 0}
            sameArea={isSameArea(x, y)}
            sameNumber={selectedValue !== null && selectedValue !== 0 && value === selectedValue && !isSelected(x, y)}
            conflictingNumber={initialGridValue[y][x] === 0 && invalidSet.has(`${x},${y}`)}
            on:click={() => handleCellClick(y, x)}
          />
        {/each}
      {/each}
    </div>
  </div>
</div>

<style>
  .board-padding { @apply px-4 pb-4; }
  .hint-banner {
    background: #dbeafe; color: #1e40af; text-align: center; padding: 8px 12px;
    border-radius: 8px 8px 0 0; font-weight: bold; margin-bottom: 4px; border: 2px solid #3b82f6;
  }
  .explore-banner {
    background: #fef3c7; color: #92400e; text-align: center; padding: 8px 12px;
    border-radius: 8px 8px 0 0; font-weight: bold; margin-bottom: 4px; border: 2px solid #f59e0b;
  }
  .explore-banner button {
    display: inline-block;
    background: #d97706;
    border: 2px solid #92400e;
    color: white;
    cursor: pointer;
    margin: 4px 8px;
    padding: 6px 16px;
    border-radius: 6px;
    font-weight: bold;
    font-size: 14px;
}
</style>