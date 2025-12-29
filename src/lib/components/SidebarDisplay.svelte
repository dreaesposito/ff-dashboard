<script>
  /* Utility functions */
  import { cn, formatName } from "$lib/utils.js";
  /* shadcn Components */
  import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
  import { Switch } from "$lib/components/ui/switch/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import * as Select from "$lib/components/ui/select/index";

  let { fantasyCalcData, selectedLeague } = $props();

  let filterPosition = $state("All");
  let positionFilteredList = $derived(
    filterPosition === "All"
      ? fantasyCalcData
      : fantasyCalcData.filter((p) => p.position === filterPosition)
  );

  let filterAvailable = $state(false);
  let leaguePlayers = $derived(
    selectedLeague.rosters?.map((roster) => roster.players).flat() ?? []
  );
  let availablePlayers = $derived(
    positionFilteredList.filter(
      (p) => !leaguePlayers.find((o) => p.sleeperId === o.sleeperId)
    )
  );
  let currentView = $derived.by(() =>
    filterAvailable ? availablePlayers : positionFilteredList
  );
</script>

<ScrollArea class="h-dvh border rounded p-2">
  <div class="flex justify-between pb-2 px items-center">
    <div>
      <Select.Root type="single" bind:value={filterPosition}>
        <Select.Trigger>{filterPosition}</Select.Trigger>
        <Select.Content>
          {#each ["All", "QB", "RB", "WR", "TE"] as position}
            <Select.Item value={position} label={position}
              >{position}</Select.Item
            >
          {/each}
        </Select.Content>
      </Select.Root>
    </div>
    <div class="flex gap-3">
      <Switch
        id="show-available"
        onCheckedChange={() => (filterAvailable = !filterAvailable)}
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
