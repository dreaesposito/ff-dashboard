<script>
  import { base } from '$app/paths';
  import { onMount } from "svelte";
  import * as Select from "$lib/components/ui/select/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Undo2 } from "@lucide/svelte";
  import { getLeagueMatchup } from "$lib/dataUtils.svelte";

  /** @type {import('./$types').PageProps} */
  let { data } = $props();
  let leagueName = $state("unknown");
  let matchupPairsArray = $state(structuredClone(data.matchupPairsArray));
  let isLoading = $state(true);

  let weeks = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "12",
    "13",
    "14",
    "15",
    "16",
    "17",
    "18",
  ];
  let currWeek = $state("1");

  async function updateWeek() {
    isLoading = true;
    matchupPairsArray = await getLeagueMatchup(data.leagueID, currWeek)
    setupLeague();
    isLoading = false;
  }

  function setupLeague() {
    const selected = sessionStorage.getItem("selected_league");
    if (selected) {
      let selectedLeague = JSON.parse(selected);
      leagueName = selectedLeague.name;

      matchupPairsArray.forEach((matchup) => {
        matchup[0].user = selectedLeague.rosters?.find(
          (r) => r.roster_id === matchup[0].roster_id
        )?.user;
        matchup[1].user = selectedLeague.rosters?.find(
          (r) => r.roster_id === matchup[1].roster_id
        )?.user;
      });
    }
  }

  onMount(() => {
    setupLeague();
    isLoading = false;
  });
</script>

<div
  class="flex py-2 gap-8 justify-center items-center sticky top-0 backdrop-blur-sm bg-background/60 w-full h-full shadow-xl"
>
  <Button href={`${base || "/"}`}><Undo2 />Home</Button>

  <div class="bg-primary/3 rounded-md outline-1 py-1 px-3">{leagueName}</div>

  <div class="flex justify-between gap-2 items-center">
    <div>Week:</div>

    <div>
      <Select.Root
        type="single"
        bind:value={currWeek}
        onValueChange={updateWeek}
      >
        <Select.Trigger>{currWeek}</Select.Trigger>
        <Select.Content>
          {#each weeks as week}
            <Select.Item value={week} label={week}>{week}</Select.Item>
          {/each}
        </Select.Content>
      </Select.Root>
    </div>
  </div>
</div>


{#if isLoading}
  <div></div>
{:else}
  {#each matchupPairsArray as matchup}
  <div class="flex justify-evenly py-4">
    <!-- TODO: flesh out a proper matchup component: <MatchupDisplay {matchup}> -->
    <div>{matchup[0].user?.display_name}: {matchup[0].points} {matchup[0].points < matchup[1].points ? "" : "✅"}</div>
    <div>{matchup[0].points < matchup[1].points ? "✅" : ""} {matchup[1].user?.display_name}: {matchup[1].points}</div>
  </div>
  <br/>
  {/each}
{/if}
