<script>
  import * as ButtonGroup from "$lib/components/ui/button-group/index.js";
  import ThemeToggle from "$lib/components/ThemeToggle.svelte";
  import TeamCard from "$lib/components/TeamCard.svelte";
  import { Loader2Icon, Trophy } from "@lucide/svelte";
  import { Input } from "$lib/components/ui/input";
  import { Button } from "$lib/components/ui/button";
  import * as Empty from "$lib/components/ui/empty/index.js";
  import SidebarDisplay from "$lib/components/SidebarDisplay.svelte";
  import { Switch } from "$lib/components/ui/switch/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import * as Resizable from "$lib/components/ui/resizable/index.js";
  import { Skeleton } from "$lib/components/ui/skeleton/index.js";
  import { testRosters, testUsers } from "$lib/testData";
  import { maxDate } from "@internationalized/date";
  import { ratioPercentage } from "$lib/utils.js";

  /** @type {import('./$types').PageProps} */
  let { data } = $props();

  const numSkeletons = 10;

  let inTimeout = $state(false); // to set a timer before another api request can be made
  let leagueID = $state(import.meta.env.VITE_TEST_ID ?? "");
  let loadingLeague = $state(false);
  let sleeperData = $state({ rosters: [], users: [] });
  let fantasyCalcData = $state(data.fantasyCalcData);
  const validInput = $derived(leagueID.match(/^\d{18,19}$/)); // 18 or 19 digit regex

  sleeperData.users = testUsers;
  sleeperData.rosters = testRosters;
  transformData(sleeperData);

  let maxTeamValue = $derived(
    Math.max(...sleeperData.rosters.map((r) => r.totalValue))
  );
  let minTeamValue = $derived(
    Math.min(...sleeperData.rosters.map((r) => r.totalValue))
  );

  function onTeamClick(roster) {
    sleeperData.rosters.forEach((r) => (r.players.isSelected = "false"));
    if (roster === null) {
      fantasyCalcData.forEach((playerObj) => playerObj.isSelected = false);
    } else {
      roster.isSelected = "true";
        // highlight the players from the team that was selected
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

    transformData(sleeperData);

    loadingLeague = false;
  }

  function transformData(sleeperData) {
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
  }
</script>

<div class="grid grid-cols-10 py-2">
  <div class="col-span-3 lg:col-span-2 flex justify-between">
    <ThemeToggle class="pl-4" />
  </div>
  <div class="col-span-6 lg:col-span-8 lg:place-items-center place-items-end">
    <form class="flex max-w-sm items-center space-x-2 pr-4">
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

<Resizable.PaneGroup
  direction="horizontal"
  class="max-w-screen rounded-lg border"
>
  <Resizable.Pane defaultSize={20}>
    <div class="col-span-3 lg:col-span-2">
      {#await data}
        <p class="pt-5 text-center font-bold">Loading player data...</p>
      {:then data}
        <SidebarDisplay {fantasyCalcData} {sleeperData} />
      {:catch error}
        <p class="pt-5 text-center font-bold">Error loading data...</p>
      {/await}
    </div>
  </Resizable.Pane>
  <Resizable.Handle withHandle />
  <Resizable.Pane defaultSize={80}>
    <div class="col-span-10 md:col-span-8 min-h-dvh">
      {#if sleeperData.rosters.length <= 0 && !loadingLeague}
        <Empty.Root class="h-[70%]">
          <Empty.Header>
            <Empty.Media variant="icon">
              <Trophy />
            </Empty.Media>
            <Empty.Title>No league to display...</Empty.Title>
            <Empty.Description class="text-md w-xl">
              Enter your <a
                class="underline cursor-pointer"
                href="https://support.sleeper.com/en/articles/4121798-how-do-i-find-my-league-id"
                >Sleeper League ID</a
              > above to get started.</Empty.Description
            >
          </Empty.Header>
          <Empty.Content></Empty.Content>
        </Empty.Root>
      {:else if loadingLeague}
        {#each Array(numSkeletons) as _, i}
          <div class="pb-4 px-2 w-full">
            <Skeleton class="w-full p-1 h-17" />
          </div>
        {/each}
      {:else if true}
        {#each sleeperData.rosters as team, i}
          <div class="pb-4 px-1">
            <TeamCard
              teamName={getTeamName(team.owner_id)}
              players={team.players}
              totalValue={team.totalValue}
              trendValue={team.trend30Day}
              bind:selected={team.players.isSelected}
              rank={i + 1}
              widthValue={ratioPercentage(team.totalValue, maxTeamValue)}
              {onTeamClick}
            />
          </div>
        {/each}
      {/if}
    </div>
  </Resizable.Pane>
</Resizable.PaneGroup>
