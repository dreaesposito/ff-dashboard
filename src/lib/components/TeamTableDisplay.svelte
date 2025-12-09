<script>
  import { red } from "@mui/material/colors";
  import PositionTable from "./PositionTable.svelte";

  let { players } = $props();
  const positions = [
    { type: "QB", colour: "bg-quarterback/40" },
    { type: "RB", colour: "bg-running-back/40" },
    { type: "WR", colour: "bg-wide-receiver/40" },
    { type: "TE", colour: "bg-tight-end/40" },
  ];
</script>

<div class="lg:grid lg:grid-cols-4 rounded-md">
  {#each positions as position}
    <div>
      <PositionTable
        players={players.filter((p) => p.player.position === position.type)}
        position={position.type}
        colour={position.colour + " border-primary/10"}
      />
    </div>
  {/each}
</div>
