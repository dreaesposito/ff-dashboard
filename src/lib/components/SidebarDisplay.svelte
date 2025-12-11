<script>
  import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
  import { cn, formatName } from "$lib/utils.js";
  import { Switch } from "$lib/components/ui/switch/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  let { fantasyCalcData, sleeperData } = $props();

  let filtered = $state(false);

  let currentView = $derived.by(() => {
    // filter shows players that do not exist in a team roster
    return filtered
      ? fantasyCalcData.filter(
          (p) =>
            !sleeperData.rosters.some((r) =>
              r.players.find(
                (pObj) => pObj.player.sleeperId === p.player.sleeperId
              )
            )
        )
      : fantasyCalcData;
  });

  cn();
</script>

<ScrollArea class="h-dvh border rounded p-2">
  <div class="flex justify-between pb-2  px items-center">
    <div>Rankings</div>
    <div class="flex gap-3">
      <Switch
        id="show-available"
        onCheckedChange={() => (filtered = !filtered)}
      />
      <Label for="show-available">Available </Label>
    </div>
  </div>
  <div class="flex justify-between font-bold pb-1">
    <div>#</div>
    <div>Player</div>
    <div>Value</div>
  </div>
  <hr class="h-px my-1 bg-primary/10 border-0 col-span-10" />
  {#each currentView as playerObj, i}
    <div
      class={cn(
        "p-1 m-0 rounded-sm hover:bg-primary/10 transition duration-200 ease-in-out",
        i % 2 == 0 ? "bg-primary/2" : "",
        playerObj.isSelected
          ? "bg-accent-foreground/25 hover:bg-accent-foreground/25"
          : ""
      )}
    >
      <div class={cn("flex flex-wrap justify-between text text-primary/95")}>
        <div class="overflow-clip">{playerObj.overallRank}</div>
        <div class="truncate">{formatName(playerObj.player.name)}</div>
        <div class="truncate">{playerObj.redraftValue}</div>
      </div>
    </div>
  {/each}
</ScrollArea>
