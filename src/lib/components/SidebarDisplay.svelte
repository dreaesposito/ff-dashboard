<script>
  import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
  import { cn, formatName } from "$lib/utils.js";
  let { currentView } = $props();

  cn();
</script>

<ScrollArea class="h-dvh rounded border p-4 hidden md:block">
  <div class="flex justify-between font-bold pb-1">
    <div>#</div>
    <div>Player</div>
    <div>Value</div>
  </div>
  {#each currentView as playerObj, i}
    <div
      class={cn(
        "flex justify-between text text-primary/95 rounded-sm",
        i % 2 == 0 ? "bg-primary/2" : "",
        playerObj.isSelected ? "bg-primary/20" : ""
      )}
    >
      <div>{playerObj.overallRank}</div>
      <div>{formatName(playerObj.player.name)}</div>
      <div>{playerObj.redraftValue}</div>
    </div>
    <hr class="h-px my-1 bg-primary/10 border-0 col-span-10" />
  {/each}
</ScrollArea>
