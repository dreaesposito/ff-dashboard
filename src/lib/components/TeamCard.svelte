<script>
  import { onMount } from "svelte";
  import { isArrayLiteralExpression } from "typescript";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Accordion from "$lib/components/ui/accordion/index.js";
  import TeamTableDisplay from "./TeamTableDisplay.svelte";

  let {
    class: className = "",
    teamName,
    players,
    onTeamClick,
    totalValue,
    trendValue,
    rank,
  } = $props();

  let roster = $state([]);

  onMount(() => {
    players.sort((a, b) => {
      return b.redraftValue - a.redraftValue;
    });
  });
</script>

<Accordion.Root
  type="single"
  onclick={() => onTeamClick(players)}
  class={`w-full border p-2 rounded-md hover:bg-foreground/5 hover:shadow-lg hover:cursor-pointer transition-all duration-200 ${className}`}
>
  <Accordion.Item>
    <Accordion.Trigger class="cursor-pointer ">
      <div class="text-xl">
        {rank}. {teamName}
        <Button variant="outline" size="sm">{totalValue}</Button>
        <Button variant="outline" size="sm">{trendValue}</Button>
      </div>
    </Accordion.Trigger>
    <Accordion.Content class="flex flex-col gap-4 text-balance">
      <TeamTableDisplay {players} />
    </Accordion.Content>
  </Accordion.Item>
</Accordion.Root>
