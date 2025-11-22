<script>
  import { onMount } from "svelte";
  import { isArrayLiteralExpression } from "typescript";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Accordion from "$lib/components/ui/accordion/index.js";
  import TeamTableDisplay from "./TeamTableDisplay.svelte";

  let { teamName, players, onTeamClick, totalValue, trendValue, rank } = $props();

  let roster = $state([]);

  onMount(() => {
    players.sort((a, b) => {
      return b.redraftValue - a.redraftValue;
    });
  });
</script>

<div
  class="p-2 bg-primary/15 rounded-md hover:bg-primary/35 hover:shadow-xl hover:cursor-pointer selection:bg-primary/35 transition-all duration-200"
  onclick={() => onTeamClick(players)}
>
  <Accordion.Root type="single" class="w-full">
    <Accordion.Item>
      <Accordion.Trigger>
        <div class="text-xl font-bold">
          {rank}. {teamName}
          <Button variant="outline" size="sm">{totalValue}</Button>
          <Button variant="outline" size="sm">{trendValue}</Button>
        </div>
      </Accordion.Trigger>
      <Accordion.Content
        class="flex flex-col gap-4 text-balance"
        hiddenUntilFound
      >
      <TeamTableDisplay {players} />
      </Accordion.Content>
    </Accordion.Item>
  </Accordion.Root>
</div>
