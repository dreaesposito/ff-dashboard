<script>
  import PlayerColumnDisplay from "./PlayerColumnDisplay.svelte";

  let { players } = $props();
  console.log(players);
</script>

<div class="grid grid-cols-4 rounded-md">
  <!-- Quarterbacks column -->
  <div>
    <div class="font-bold underline">QB</div>
    <div>
      {#each players.filter((p) => p.player.position === "QB") as playerObj}
        <PlayerColumnDisplay {playerObj} />
      {/each}
    </div>
  </div>

  <!-- Running backs column -->
  <div>
    <div class="font-bold underline">RB</div>
    <div>
      {#each players.filter((p) => p.player.position === "RB") as playerObj}
        <PlayerColumnDisplay {playerObj} />
      {/each}
    </div>
  </div>

  <!-- Wide receivers column -->
  <div>
    <div class="font-bold underline">WR</div>
    <div>
      {#each players.filter((p) => p.player.position === "WR") as playerObj}
        <PlayerColumnDisplay {playerObj} />
      {/each}
    </div>
  </div>

  <!-- Tight ends column -->
  <div>
    <div class="font-bold underline">TE</div>
    <div>
      {#each players.filter((p) => p.player.position === "TE") as playerObj}
        <PlayerColumnDisplay {playerObj} />
      {/each}
    </div>
  </div>
</div>
