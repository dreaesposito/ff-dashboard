<script>
  import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
  import { cn, formatName } from "$lib/utils.js";
  import { Switch } from "$lib/components/ui/switch/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  let { fantasyCalcData, selectedLeague } = $props();

  let filtered = $state(false);
  let leaguePlayers = $derived(selectedLeague.map(league => league.players).flat());
  let availablePlayers = $derived(fantasyCalcData.filter(p => !leaguePlayers.find(o => p.sleeperId === o.sleeperId)));
  let currentView = $derived.by(() => filtered ? availablePlayers : fantasyCalcData);

  cn();
</script>

<ScrollArea class="h-dvh border rounded p-2">
  <div class="flex justify-between pb-2 px items-center">
    <div>Rankings</div>
    <div class="flex gap-3">
      <Switch
        id="show-available"
        onCheckedChange={() => (filtered = !filtered)}
      />
      <Label for="show-available">Available</Label>
    </div>
  </div>
  <div class="flex justify-between font-bold pb-1">
    <div>#</div>
    <div>Player</div>
    <div>Value</div>
  </div>
  <hr class="h-px my-1 bg-primary/10 border-0 col-span-10" />
  {#each currentView as player, i}
    <div
      class={cn(
        "p-1 m-0 rounded-sm hover:bg-primary/10 transition duration-200 ease-in-out",
        i % 2 == 0 ? "bg-primary/2" : "",
        player.isSelected
          ? "bg-accent-foreground/25 hover:bg-accent-foreground/25"
          : ""
      )}
    >
      <div class={cn("flex flex-wrap justify-between text text-primary/95")}>
        <div class="overflow-clip">{player.overallRank}</div>
        <div class="truncate">{formatName(player.name)}</div>
        <div class="truncate">{player.redraftValue}</div>
      </div>
    </div>
  {/each}
</ScrollArea>
