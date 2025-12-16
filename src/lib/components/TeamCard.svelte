<script>
  import { onMount } from "svelte";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Accordion from "$lib/components/ui/accordion/index.js";
  import TeamTableDisplay from "./TeamTableDisplay.svelte";
  import { TrendingUp, TrendingDown } from "@lucide/svelte";
  import { cn, ratioPercentage } from "$lib/utils.js";
  import { Badge } from "$lib/components/ui/badge/index.js";

  let {
    teamName,
    players,
    onTeamClick,
    totalValue,
    trendValue,
    selected = $bindable(),
    rank,
    widthValue,
  } = $props();

  let maxValue = $derived(totalValue);
  let minValue = $state(0);
  let isOpen = $state(false);

  let accordionRef = $state(null);

  let roster = $state([]);

  let qbValue = $derived(
    players.reduce((acc, player) => {
      return player.position === "QB" ? acc + player.redraftValue : acc;
    }, 0)
  );

  let rbValue = $derived(
    players.reduce((acc, player) => {
      return player.position === "RB" ? acc + player.redraftValue : acc;
    }, 0)
  );

  let wrValue = $derived(
    players.reduce((acc, player) => {
      return player.position === "WR" ? acc + player.redraftValue : acc;
    }, 0)
  );

  let teValue = $derived(
    players.reduce((acc, player) => {
      return player.position === "TE" ? acc + player.redraftValue : acc;
    }, 0)
  );

  let background = $derived.by(() => {
    if (trendValue == 0) "bg-background";

    const opacity_strength = trendValue / 20000;
    return trendValue > 0
      ? `rgba(0, 255, 0, ${opacity_strength})`
      : `rgba(255, 0, 0, ${-1 * opacity_strength})`;
  });

  let baseClass = "w-[25%] text-foreground/25";

  onMount(() => {
    players.sort((a, b) => {
      return b.redraftValue - a.redraftValue;
    });
  });
</script>

<Accordion.Root
  value={rank+teamName}
  aria-selected={selected}
  type="single"
  onclick={() => {
    if (accordionRef?.getAttribute("data-state") === "closed")
      onTeamClick(players);
  }}
  class={`w-full border p-2 rounded-md hover:bg-foreground/3 aria-selected:bg-foreground/5 
  aria-selected:border-foreground/20 hover:shadow-lg hover:cursor-pointer transition-all duration-200`}
>
  <Accordion.Item>
    <Accordion.Trigger
      class="overflow-hidden"
      bind:ref={accordionRef}
      onclick={() => {
        if (
          accordionRef?.getAttribute("data-state") === "open" &&
          selected === "true"
        ) {
          selected = "false";
          onTeamClick(null);
        }
      }}
    >
      <div
        class="flex items-center justify-between cursor-pointer text-lg min-w-full"
      >
        <div
          class="flex min-w-[45%] max-w-[45%] justify-between overflow-hidden"
        >
          <div class="truncate">{rank}. {teamName}</div>
          <Badge variant="outline" class="justify-evenly overflow-hidden"
            ><p class="m-2">Value: {totalValue}</p>

            <Badge
              class="px-2 text-foreground/80 border-foreground/10"
              style="background: {background};"
            >
              {trendValue}
              {#if trendValue > 0}
                <TrendingUp />
              {:else if trendValue < 0}
                <TrendingDown />
              {/if}
            </Badge>
          </Badge>
        </div>

        <!-- value bar "component" -->
        <div
          class="flex min-w-[50%] max-w-[50%] border-foreground/5 justify-end border-2 rounded-sm overflow-hidden"
        >
          <div
            class="flex text-center content-center text-xs h-5"
            style="width: {widthValue}%;"
          >
            <!-- need to add css vars for inner text colour -->
            <div
              class={cn(baseClass, "bg-quarterback rounded-l-sm")}
              style="width: {ratioPercentage(qbValue, totalValue)}%;"
            >
              QB
            </div>
            <div
              class={cn(baseClass, "bg-running-back")}
              style="width: {ratioPercentage(rbValue, totalValue)}%;"
            >
              RB
            </div>
            <div
              class={cn(baseClass, "bg-wide-receiver")}
              style="width: {ratioPercentage(wrValue, totalValue)}%;"
            >
              WR
            </div>
            <div
              class={cn(baseClass, "bg-tight-end rounded-r-sm")}
              style="width: {ratioPercentage(teValue, totalValue)}%;"
            >
              TE
            </div>
          </div>
        </div>
      </div>
    </Accordion.Trigger>
    <Accordion.Content
      class="flex flex-col gap-4 text-balance"
      onclick={() => onTeamClick(players)}
    >
      <TeamTableDisplay {players} />
    </Accordion.Content>
  </Accordion.Item>
</Accordion.Root>
