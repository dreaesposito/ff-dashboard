<script>
  import { cn } from "$lib/utils.js";
  import { formatName } from "$lib/utils.js";
  import Button from "$lib/components//ui/button/button.svelte";
  import ButtonGroupSeparator from "./ui/button-group/button-group.svelte";
  import { ArrowDown } from "@lucide/svelte";

  let { players, position, colour } = $props();
  let sortOnValue = $state(true);
  let sortedPlayers = $derived.by(() => {
    if (sortOnValue) {
        return players.toSorted((a, b) => b.redraftValue - a.redraftValue);
    } else {
        return players.toSorted((a, b) => b.trend30Day - a.trend30Day)
    }
  });

  let baseClass =
    "bg-foreground/2 shadow-xs h-7 px-4 py-1 border border-primary/10";

  function hoverVal(shouldHover) {
    return shouldHover ? "hover:primary/10" : "";
  }

  // map input value to a colour
  function color(n) {
    if (-200 <= n && n <= 200) {
      return `rgba(150, 150, 150, 0.3)`;
    } else {
      const normalized = (n + 1500) / (2200 + 1500); // (-1500, 2200) is the range
      let r = Math.floor(255 * (1 - normalized)); // Red colour slider
      let g = Math.floor(255 * normalized); // Green colour slider

      return `rgba(${r}, ${g}, 0, 0.3)`;
    }
  }
</script>

<div class="w-[95%] text-primary/95">
  <div class="inline-flex my-1.5 rounded-sm w-full overflow-hidden">
    <div class={cn(colour, "pl-2 border rounded-s-sm min-w-0 w-8/10")}>
      {position}
    </div>
    <button
      onclick={() => (sortOnValue = true)}
      class={cn(
        colour,
        "flex justify-around items-center border w-18 min-w-18 text-center border-x-0",
        hoverVal(!sortOnValue)
      )}
    >
      Value
      {#if sortOnValue}
        <ArrowDown size="15px" />
      {/if}
    </button>
    <button
      onclick={() => (sortOnValue = false)}
      class={cn(
        colour,
        "flex justify-around items-center border rounded-e-sm w-18 min-w-18 text-center",
        hoverVal(sortOnValue)
      )}
    >
      Trend
      {#if !sortOnValue}
        <ArrowDown size="15px" />
      {/if}
    </button>
  </div>
  {#each sortedPlayers as p}
    <div class="inline-flex my-1.5 rounded-sm w-full overflow-hidden">
      <div class={cn(baseClass, "rounded-s-sm min-w-0 w-8/10")}>
        {formatName(p.player.name)}
      </div>
      <div class={cn(baseClass, "w-18 min-w-18 text-center border-x-0")}>
        {p.redraftValue}
      </div>
      <div
        class={cn(baseClass, "rounded-e-sm w-18 min-w-18 text-center")}
        style="background: {color(p.trend30Day)};"
      >
        {p.trend30Day}
      </div>
    </div>
  {/each}
</div>
