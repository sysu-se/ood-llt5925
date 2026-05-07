<script>
  import { gameStore } from '../../../stores/gameStore.js';

  const canUndo = gameStore.canUndo;
  const canRedo = gameStore.canRedo;
  const gamePaused = gameStore.gamePaused;
  const isExploring = gameStore.isExploring;
  const exploreCanUndo = gameStore.exploreCanUndo;
  const exploreCanRedo = gameStore.exploreCanRedo;

  $: canUndoValue = $canUndo;
  $: canRedoValue = $canRedo;
  $: gamePausedValue = $gamePaused;
  $: isExploringValue = $isExploring;
  $: exploreCanUndoValue = $exploreCanUndo;
  $: exploreCanRedoValue = $exploreCanRedo;

  $: undoDisabled = isExploringValue ? !exploreCanUndoValue : !canUndoValue;
  $: redoDisabled = isExploringValue ? !exploreCanRedoValue : !canRedoValue;

  function handleUndo() {
    isExploringValue ? gameStore.exploreUndo() : gameStore.undo();
  }
  function handleRedo() {
    isExploringValue ? gameStore.exploreRedo() : gameStore.redo();
  }
</script>

<div class="action-buttons space-x-3">
  <button class="btn btn-round" disabled={undoDisabled || gamePausedValue} on:click={handleUndo} title="Undo">
    <svg class="icon-outline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
    </svg>
  </button>

  <button class="btn btn-round" disabled={redoDisabled || gamePausedValue} on:click={handleRedo} title="Redo">
    <svg class="icon-outline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 10h-10a8 8 90 00-8 8v2M21 10l-6 6m6-6l-6-6" />
    </svg>
  </button>

  <button class="btn btn-round" disabled={isExploringValue || gamePausedValue} on:click={() => gameStore.getHint()} title="Hint">
    <svg class="icon-outline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  </button>

  {#if isExploringValue}
    <button class="btn btn-small" style="background:#22c55e;color:white;padding:8px 16px;border-radius:8px;font-weight:bold;" on:click={() => gameStore.commitExplore()}>
      提交
    </button>
    <button class="btn btn-small" style="background:#ef4444;color:white;padding:8px 16px;border-radius:8px;font-weight:bold;" on:click={() => gameStore.abortExplore()}>
      放弃
    </button>
  {:else}
    <button class="btn btn-round" disabled={gamePausedValue} on:click={() => gameStore.startExplore()} title="探索模式">
      <svg class="icon-outline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </button>
  {/if}
</div>

<style>
  .action-buttons { @apply flex flex-wrap justify-evenly self-end; }
</style>