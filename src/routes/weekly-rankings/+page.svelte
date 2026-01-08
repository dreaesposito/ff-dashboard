<script>
  import { base } from '$app/paths';
  import Button from "$lib/components/ui/button/button.svelte";
  import * as Select from "$lib/components/ui/select/index.js";
  import * as Table from "$lib/components/ui/table/index.js";
  import { formatNameCSV } from "$lib/utils.js";
  import { Undo2 } from "@lucide/svelte";

  /** @type {import('./$types').PageProps} */
  let { data } = $props();

  let { weeklyRankings, lastUpdated } = $derived(data);

  const DATA_SOURCE = "https://fantasyfootballtiers.com/gallery_files/";

  const positions = [
    { value: "QB", label: "Quarterbacks", dataSrc: "QB" },
    { value: "WR", label: "Wide receivers", dataSrc: "WR-PPR" },
    { value: "RB", label: "Running backs", dataSrc: "RB-PPR" },
    { value: "TE", label: "Tight ends", dataSrc: "TE-PPR" },
    { value: "K", label: "Kickers", dataSrc: "K" },
    { value: "DST", label: "Defences", dataSrc: "DST" },
    { value: "all", label: "All" },
  ];

  let currentViewValue = $state("chart");

  const viewTriggerLabel = $derived(
    currentViewValue === "chart" ? "FF Tiers" : "Fantasy Sharks"
  );

  let currentViewPositions = $derived.by(() => {
    if (currentViewValue === "table") {
      return positions.filter(
        (pos) => pos.value !== "K" && pos.value !== "DST"
      );
    } else {
      return positions.filter((pos) => pos.value !== "all");
    }
  });

  let currentPositionValue = $state(positions[0].value);

  const positionTriggerLabel = $derived(
    positions.find((p) => p.value === currentPositionValue)?.label
  );

  const currentDataSrc = $derived(
    positions.find((p) => p.value === currentPositionValue)?.dataSrc
  );

  const filteredRankings = $derived.by(() => {
    if (currentPositionValue === "all") {
      return weeklyRankings;
    } else {
      return weeklyRankings.filter(
        (player) =>
          player.Pos === currentPositionValue
      );
    }
  });
</script>

<div class="flex flex-col items-center">
  <div
  class="flex py-2 gap-4 justify-center sticky top-0 backdrop-blur-sm bg-background/60 w-full h-full shadow-xl"
  >
  <Button href={`${base || "/"}`}><Undo2/>Home</Button>
    <Select.Root type="single" name="tableView" bind:value={currentViewValue}>
      <Select.Trigger>{viewTriggerLabel}</Select.Trigger>
      <Select.Content>
        <Select.Group>
          <Select.Label>Data Source (PPR)</Select.Label>
          <Select.Item value="chart" label="FF Tiers" disabled={currentPositionValue === "all"}/>
          <Select.Item value="table" label="Fantasy Sharks" disabled={currentPositionValue === "K" || currentPositionValue === "DST"}/>
        </Select.Group>
      </Select.Content>
    </Select.Root>

    <Select.Root
      type="single"
      name="positionTiers"
      bind:value={currentPositionValue}
    >
      <Select.Trigger>
        {positionTriggerLabel}
      </Select.Trigger>
      <Select.Content>
        <Select.Group>
          <Select.Label>Positions (PPR)</Select.Label>
          {#each currentViewPositions as position (position.value)}
            <Select.Item value={position.value} label={position.label}>
              {position.label}
            </Select.Item>
          {/each}
        </Select.Group>
      </Select.Content>
    </Select.Root>
  </div>

  <div class="flex flex-col px-4 gap-4 max-w-[980px]">
    {#if currentViewValue === "table"}
      <Table.Root>
        <Table.Caption>Weekly Projections (last updated: {lastUpdated})</Table.Caption>
        <Table.Header>
          <Table.Head>Overall Rank</Table.Head>
          <Table.Head>Name</Table.Head>
          <Table.Head>Team</Table.Head>
          <Table.Head>Opponent</Table.Head>
          <Table.Head>Projected Points</Table.Head>
        </Table.Header>
        <Table.Body>
          {#each filteredRankings as player}
            <Table.Row>
              <Table.Cell>{player.Rank}</Table.Cell>
              <Table.Cell>{formatNameCSV(player.Name)}</Table.Cell>
              <Table.Cell>{player.Team}</Table.Cell>
              <Table.Cell>{player.Opp}</Table.Cell>
              <Table.Cell>{player.FantasyPoints}</Table.Cell>
            </Table.Row>
          {/each}
        </Table.Body>
      </Table.Root>
    {:else}
      <img
        alt={`${currentPositionValue} tier graph`}
        src={`${DATA_SOURCE}${currentDataSrc}.webp`}
        width="100%"
      />

      <iframe
        class="w-full"
        title={`${currentPositionValue} tier list`}
        src={`${DATA_SOURCE}${currentDataSrc}.html`}
        width="100%"
      ></iframe>
    {/if}
  </div>
</div>
