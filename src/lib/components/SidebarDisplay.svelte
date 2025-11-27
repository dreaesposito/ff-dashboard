<script>
  import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
  import { cn, formatName } from "$lib/utils.js";
  let { currentView } = $props();

  cn();
</script>

<ScrollArea class="h-dvh border rounded p-2">
  <div class="flex justify-between font-bold pb-1">
    <div>#</div>
    <div>Player</div>
    <div>Value</div>
  </div>
  <hr class="h-px my-1 bg-primary/10 border-0 col-span-10" />
  {#each currentView as playerObj, i}
    <div
      class={cn(
        "p-1 m-0 rounded-sm hover:bg-primary/10",
        i % 2 == 0 ? "bg-primary/2" : "",
        playerObj.isSelected ? "bg-accent-foreground/25 hover:bg-accent-foreground/25" : ""
      )}
    >
      <div
        class={cn(
          "flex flex-wrap justify-between text text-primary/95"
        )}
      >
        <div>{playerObj.overallRank}</div>
        <div>{formatName(playerObj.player.name)}</div>
        <div>{playerObj.redraftValue}</div>
      </div>
    </div>
  {/each}
</ScrollArea>
