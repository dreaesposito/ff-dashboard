<script>
  import { onMount } from "svelte";
  import { sampleLeagues } from "$lib/demoData-leagues";
  /* Utility functions */
  import { getUserLeagues, getFantasyCalcData } from "$lib/dataUtils.svelte.js";
  import { ratioPercentage } from "$lib/utils.js";
  /* shadcn Components */
  import { Skeleton } from "$lib/components/ui/skeleton/index.js";
  import * as ButtonGroup from "$lib/components/ui/button-group/index.js";
  import ThemeToggle from "$lib/components/ThemeToggle.svelte";
  import * as Empty from "$lib/components/ui/empty/index.js";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import * as Select from "$lib/components/ui/select/index.js";
  import * as Resizable from "$lib/components/ui/resizable/index.js";
  /* Custom Components */
  import TeamCard from "$lib/components/TeamCard.svelte";
  import SidebarDisplay from "$lib/components/SidebarDisplay.svelte";
  /* Icons */
  import { Import, Loader2Icon, Trophy, TriangleAlert, ChartBarIncreasing, Swords } from "@lucide/svelte";

  /* constants */
  const NUM_SKELETONS = 10;
  const MIN_REQUEST_WAIT_MS = 5000; // 5 seconds

  /* stateful variables */
  let loadingLeague = $state(false);
  let leagues = $state([]);
  let fantasyCalcData = $state([]);
  let leagueID = $state(null);
  let username = $state(import.meta.env.VITE_TEST_USER ?? "");
  let inTimeout = $state(false);
  let timeoutSecondsLeft = $state(MIN_REQUEST_WAIT_MS / 1000);

  let selectedLeague = $derived(
    leagues.find((l) => l.leagueID === leagueID) ?? []
  );

  onMount(async () => {
    try {
      fantasyCalcData = await getFantasyCalcData();
    } catch (err) {
      fantasyCalcData = null;
      alert(err.message);
    }
  });

  async function loadLeagues() {
    if (inTimeout) return;
    inTimeout = true;
    onTeamClick(null);
    timeoutSecondsLeft = MIN_REQUEST_WAIT_MS / 1000;
    setTimeout(() => {
      inTimeout = false;
    }, MIN_REQUEST_WAIT_MS); // after x milliseconds a request can be made again
    const timer = setInterval(() => timeoutSecondsLeft > 0 ? timeoutSecondsLeft-- : clearInterval(timer), 1000);

    loadingLeague = true;
    // simulate a small wait, because the request usually too fast
    await new Promise((resolve) => setTimeout(resolve, 950));
    try {
      leagues = await getUserLeagues(username, fantasyCalcData);
      leagueID = leagues[0].leagueID;
    } catch (err) {
      alert(err.message);
    }
    loadingLeague = false;
  }

  async function loadDemoLeagues() {
    onTeamClick(null);
    loadingLeague = true;
    await new Promise((resolve) => setTimeout(resolve, 950));
    leagues = sampleLeagues;
    leagueID = leagues[0].leagueID;
    loadingLeague = false;
  }

  function onTeamClick(roster) {
    selectedLeague.rosters?.forEach(
      (league) => (league.players.isSelected = "false")
    );
    if (roster === null) {
      // no roster was selected
      fantasyCalcData.forEach((p) => (p.isSelected = false));
    } else {
      // a roster was selected
      roster.isSelected = "true";
      // highlight the players from the team that was selected
      fantasyCalcData.forEach((player) => {
        if (roster.find((p) => p.sleeperId === player.sleeperId)) {
          player.isSelected = true;
        } else {
          player.isSelected = false;
        }
      });
    }
  }

  function getTeamName(user) {
    return !user
      ? "unknown"
      : !user.metadata.team_name
        ? user.display_name
        : user.metadata.team_name;
  }
</script>

<div class="grid grid-cols-10 py-2">
  <div class="col-span-3 lg:col-span-2 flex justify-between">
    <ThemeToggle class="pl-4" />
    <Button class="cursor-pointer mr-4 shadow-md shadow-primary/50" onclick={loadDemoLeagues}>Load Demo</Button>
  </div>
  <div class="flex gap-2 col-span-7 lg:col-span-8 lg:place-items-end">
    <form class="flex max-w-sm pr-4">
      <ButtonGroup.Root>
        <Input placeholder="Sleeper Username" bind:value={username} />
        <ButtonGroup.Separator />
        <Button
          variant="outline"
          type="submit"
          class="cursor-pointer overflow-hidden"
          disabled={loadingLeague || !username || !fantasyCalcData || inTimeout}
          onclick={loadLeagues}
        >
          {#if loadingLeague}
            <Loader2Icon class="animate-spin" />
          {:else if inTimeout}
            Please wait: {timeoutSecondsLeft}
          {:else}
            Submit
          {/if}
        </Button>
      </ButtonGroup.Root>
    </form>
    {#if leagues.length > 0}
      <div class="mr-4">
        <Select.Root
          type="single"
          bind:value={leagueID}
          onValueChange={() => onTeamClick(null)}
        >
          <Select.Trigger class="w-[180px]"
            >{selectedLeague
              ? selectedLeague.name
              : "Select a league"}</Select.Trigger
          >
          <Select.Content>
            {#each leagues as league, i}
              <Select.Item value={league.leagueID} label={league.name}
                >{league.name}</Select.Item
              >
            {/each}
          </Select.Content>
        </Select.Root>
      </div>
      <Button href={`/matchups/${leagueID}`} onclick={sessionStorage.setItem("selected_league", JSON.stringify(selectedLeague))} variant="outline">Matchups<Swords/></Button>
      <Button href={"/weekly-rankings"} variant="outline">Projections<ChartBarIncreasing/></Button> 
    {/if}
  </div>
</div>

{#snippet league(selectedLeague)}
  {#each selectedLeague.rosters as team, i}
    <div class="pb-4 px-1">
      <TeamCard
        teamName={getTeamName(team.user)}
        players={team.players}
        totalValue={team.totalValue}
        trendValue={team.trend30Day}
        bind:selected={team.players.isSelected}
        rank={i + 1}
        widthValue={ratioPercentage(
          team.totalValue,
          selectedLeague.maxTeamValue
        )}
        {onTeamClick}
      />
    </div>
  {/each}
{/snippet}

<Resizable.PaneGroup
  direction="horizontal"
  class="max-w-screen rounded-lg border"
>
  <Resizable.Pane defaultSize={20}>
    <div class="col-span-3 lg:col-span-2">
      {#await fantasyCalcData}
        <p class="pt-5 text-center font-bold">Loading player data...</p>
      {:then fantasyCalcData}
        <SidebarDisplay {fantasyCalcData} {selectedLeague} />
      {:catch error}
        <p class="pt-5 text-center font-bold">Error loading data...</p>
      {/await}
    </div>
  </Resizable.Pane>
  <Resizable.Handle withHandle />
  <Resizable.Pane defaultSize={80}>
    <div class="col-span-10 md:col-span-8 min-h-dvh">
      {#if !fantasyCalcData}
        <Empty.Root class="h-[70%]">
          <Empty.Header>
            <Empty.Media variant="icon">
              <TriangleAlert />
            </Empty.Media>
            <Empty.Title>NFL data is unavailable...</Empty.Title>
            <Empty.Description class="text-md w-xl">
              Please try again later.</Empty.Description
            >
          </Empty.Header>
          <Empty.Content></Empty.Content>
        </Empty.Root>
      {:else if selectedLeague.length <= 0 && !loadingLeague}
        <Empty.Root class="h-[70%]">
          <Empty.Header>
            <Empty.Media variant="icon">
              <Trophy />
            </Empty.Media>
            <Empty.Title>No league to display...</Empty.Title>
            <Empty.Description class="text-md w-xl">
              Enter your Sleeper Username above to get started.</Empty.Description
            >
          </Empty.Header>
          <Empty.Content></Empty.Content>
        </Empty.Root>
      {:else if loadingLeague}
        {#each Array(NUM_SKELETONS) as _, i}
          <div class="pb-4 px-2 w-full">
            <Skeleton class="w-full p-1 h-17" />
          </div>
        {/each}
      {:else if selectedLeague}
        {@render league(selectedLeague)}
      {/if}
    </div>
  </Resizable.Pane>
</Resizable.PaneGroup>
