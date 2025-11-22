<script>
  import * as ButtonGroup from "$lib/components/ui/button-group/index.js";
  import ThemeToggle from "$lib/components/ThemeToggle.svelte";
  import TeamCard from "$lib/components/TeamCard.svelte";
  import { Loader2Icon } from "@lucide/svelte";
  import { Input } from "$lib/components/ui/input";
  import { Button } from "$lib/components/ui/button";
  import { Checkbox } from "$lib/components/ui/checkbox/index.js";

  /** @type {import('./$types').PageProps} */
  let { data } = $props();

  let inTimeout = $state(false); // to set a timer before another api request can be made
  let leagueID = $state(import.meta.env.VITE_TEST_ID ?? "");
  let loadingLeague = $state(false);
  let sleeperData = $state({ rosters: [], users: [] });
  let fantasyCalcData = $state(data.fantasyCalcData);
  let filtered = $state(false);
  let currentView = $derived.by(() => {
    // filter shows players that do not exist in a team roster
    return filtered
    ? fantasyCalcData.filter(p => !sleeperData.rosters.some(r => r.players.find(pObj => pObj.player.sleeperId === p.player.sleeperId)))
    : fantasyCalcData;
  });
  const validInput = $derived(leagueID.match(/^\d{18,19}$/)); // 18 or 19 digit regex

  function onTeamClick(roster) {
    fantasyCalcData.forEach((playerObj) => {
      if (
        roster.find(
          (obj) => obj.player.sleeperId === playerObj.player.sleeperId
        )
      ) {
        playerObj.isSelected = true;
      } else {
        playerObj.isSelected = false;
      }
    });
  }

  function getTeamName(ownerId) {
    const user = sleeperData.users.find(
      (teamObj) => teamObj.user_id === ownerId
    );
    return !user
      ? "unknown"
      : !user.metadata.team_name
        ? user.display_name
        : user.metadata.team_name;
  }

  async function loadPlayers() {
    if (!validInput || inTimeout) {
      return;
    }

    inTimeout = true;
    setTimeout(() => (inTimeout = false), 5000); // after 5 seconds a request can be made again

    const ROSTERS_URL = `https://api.sleeper.app/v1/league/${leagueID}/rosters`;
    const USERS_URL = `https://api.sleeper.app/v1/league/${leagueID}/users`;
    loadingLeague = true;
    // simulate a small wait, because the request usually too fast
    await new Promise((resolve) => setTimeout(resolve, 950));
    try {
      const rostersRes = await fetch(ROSTERS_URL);
      const usersRes = await fetch(USERS_URL);
      if (rostersRes.ok) sleeperData.rosters = await rostersRes.json();
      if (usersRes.ok) sleeperData.users = await usersRes.json();
    } catch (err) {
      console.error(err);
    }

    sleeperData.rosters.forEach((roster) => {
      // map each playerID in the roster to the actual player JSON object
      roster.players = roster.players.flatMap((playerId) => {
        const playerObj = data.fantasyCalcData.find(
          (playerObj) => playerObj.player.sleeperId === playerId
        );
        return playerObj ?? [];
      });

      // compute the total value of the roster
      roster.totalValue = roster.players.reduce((acc, currItem) => {
        return acc + currItem.redraftValue;
      }, 0);

      // compute the total 30 day value trend of the roster
      roster.trend30Day = roster.players.reduce((acc, currItem) => {
        return acc + currItem.trend30Day;
      }, 0);
    });

    // sort rosters in descending order
    sleeperData.rosters.sort((a, b) => b.totalValue - a.totalValue);

    loadingLeague = false;
  }
</script>

<div class="grid grid-cols-4 p-2">
  <ThemeToggle />
  <div class="flex items-center gap-3">
    <Checkbox id="terms" onCheckedChange={() => (filtered = !filtered)} />
    <label for="terms">Show available</label>
  </div>
  <div class="col-span-2">
    <form class="flex w-full max-w-sm items-center space-x-2">
      <ButtonGroup.Root>
        <Input
          placeholder="Sleeper League ID (18-19 digits)"
          bind:value={leagueID}
        />
        <ButtonGroup.Separator />
        <Button
          variant="outline"
          type="submit"
          class="cursor-pointer"
          disabled={loadingLeague || !validInput}
          onclick={loadPlayers}
        >
          {#if loadingLeague}
            <Loader2Icon class="animate-spin" />
          {/if}
          Submit
        </Button>
      </ButtonGroup.Root>
    </form>
  </div>
</div>

<div class="grid grid-cols-10">
  <div class="col-span-2 bg-primary/5 rounded-md p-2 ml-4">
    {#await data}
      <p>Loading player data...</p>
    {:then data}
      <h1 class="underline text-xl pb-2">Overall Rankings:</h1>
      {#each currentView as playerObj}
        <p
          class={`text-primary/95 " ${playerObj.isSelected ? "bg-primary/20" : ""}`}
        >
          {playerObj.overallRank}. {playerObj.player.name}
          {playerObj.redraftValue}
        </p>
      {/each}
    {:catch error}
      <p>Error loading data...</p>
    {/await}
  </div>

  <div class="col-span-8 mr-4">
    {#if sleeperData.rosters.length <= 0 && !loadingLeague}
      <div class="text-center text-primary/85 col-span-2 text-xl">
        Enter your <a
          class="underline cursor-pointer"
          href="https://support.sleeper.com/en/articles/4121798-how-do-i-find-my-league-id"
          >Sleeper League ID</a
        > above to get started...
      </div>
    {:else if loadingLeague}
      <div class="text-2xl text-center text-primary/85 col-span-2 p-2">
        Loading...
      </div>
    {:else}
      {#each sleeperData.rosters as team, i}
        <div class="pb-4 px-2">
          <TeamCard
            teamName={getTeamName(team.owner_id)}
            players={team.players}
            totalValue={team.totalValue}
            trendValue={team.trend30Day}
            rank={i + 1}
            {onTeamClick}
          />
        </div>
      {/each}
    {/if}
  </div>
</div>
