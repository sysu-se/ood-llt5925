<script>
  import { onMount } from 'svelte';
  import { gameStore } from './stores/gameStore.js';
  import { modal } from '@sudoku/stores/modal';
  import Board from './components/Board/index.svelte';
  import Controls from './components/Controls/index.svelte';
  import Header from './components/Header/index.svelte';
  import Modal from './components/Modal/index.svelte';

  const gameWon = gameStore.gameWon;

  gameWon.subscribe(won => {
    if (won) {
      gameStore.pauseGame();
      modal.show('gameover');
    }
  });

  onMount(() => {
    modal.show('welcome', { onHide: () => gameStore.resumeGame() });
  });
</script>

<header>
  <Header />
</header>

<section>
  <Board />
</section>

<footer>
  <Controls />
</footer>

<Modal />

<style global>
  @import "./styles/global.css";
</style>