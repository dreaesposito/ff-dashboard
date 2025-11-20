<script>
  import { onMount } from "svelte";
  import { isArrayLiteralExpression } from "typescript";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Accordion from "$lib/components/ui/accordion/index.js";

  let { teamName, players, onTeamClick, totalValue, rank } = $props();

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
  <Accordion.Root type="single" class="w-full sm:max-w-[70%]">
    <Accordion.Item>
      <Accordion.Trigger>
        <div class="text-xl font-bold">
          {rank}. {teamName}
          <Button variant="outline" size="sm">{totalValue}</Button>
        </div>
      </Accordion.Trigger>
      <Accordion.Content
        class="flex flex-col gap-4 text-balance"
        hiddenUntilFound
      >
        <div class="grid grid-cols-4">
          {#each players as playerObj}
            <div class="text-lg">
              {playerObj.player.name} ({playerObj.redraftValue})
            </div>
          {/each}
        </div>
      </Accordion.Content>
    </Accordion.Item>
  </Accordion.Root>
</div>
