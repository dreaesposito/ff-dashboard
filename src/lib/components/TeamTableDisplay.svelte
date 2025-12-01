<script>
  import { red } from "@mui/material/colors";
  import PositionTable from "./PositionTable.svelte";

  let { players } = $props();
  const positions = [
    { type: "QB", colour: "bg-green-50 dark:bg-green-950 border-primary/10" },
    { type: "RB", colour: "bg-blue-50 dark:bg-blue-950 border-primary/10" },
    { type: "WR", colour: "bg-red-50 dark:bg-red-950 border-primary/10" },
    { type: "TE", colour: "bg-purple-50 dark:bg-purple-950 border-primary/10" },
  ];
</script>

<div class="lg:grid lg:grid-cols-4 rounded-md">
  {#each positions as position}
    <div>
      <PositionTable
        players={players.filter((p) => p.player.position === position.type)}
        position={position.type}
        colour={position.colour}
      />
    </div>
  {/each}
</div>
