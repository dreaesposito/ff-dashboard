/** 
 * Make an api call for player value rankings
 * @returns array of the players
 */
export const getFantasyCalcData = async () => {
  const resFantasyCalc = await fetch(
    "https://api.fantasycalc.com/values/current?isDynasty=false&numQbs=1&numTeams=10&ppr=1"
  );
  let originalData = resFantasyCalc.ok ? await resFantasyCalc.json() : [];

  let fantasyCalcData = [];
  originalData.forEach((playerObj) => {
    // Destructure the player object
    // for relevant parts
    const {
      trend30Day,
      redraftValue,
      overallRank,
      player: { sleeperId, name, position },
    } = playerObj;

    fantasyCalcData.push({
      overallRank,
      name,
      position,
      isSelected: false,
      redraftValue,
      trend30Day,
      sleeperId,
    });
  });

  return fantasyCalcData;
};

/**
 * Makes a few sleeper api calls in order to get the
 * relevant information to load all of the rosters in each
 * league that a user is in.
 *
 * @param {string} username username for the Sleeper platform
 * @returns Array of leagues that the user is in
 */
export const getUserLeagues = async (username) => {
  const SLEEPER_API = "https://api.sleeper.app/v1";

  try {
    // Load the user object
    const userData = await fetch(SLEEPER_API + `/user/${username}`).then(
      (response) => response.json()
    );

    // Get the league IDs for the user
    const leagueIDS = await fetch(
      SLEEPER_API + `/user/${userData.user_id}/leagues/nfl/2025`
    ).then((response) => response.json());

    // Get the rosters for each league that the user is in
    let leagues = [];
    for (const league of leagueIDS) {
      const leagueRosters = await fetch(
        SLEEPER_API + `/league/${league.league_id}/rosters`
      ).then((response) => response.json());

      const leagueUsers = await fetch(
        SLEEPER_API + `/league/${league.league_id}/users`
      ).then((response) => response.json());

      const [rosterSet, userSet] = await Promise.all([
        leagueRosters,
        leagueUsers,
      ]);

      // For each team/roster, find the appropriate user object by using
      // its ID and assign it as an attribute (if it exists).
      rosterSet.forEach((team) => {
        team.user = userSet.find((u) => u.user_id === team.owner_id) ?? null;
      });

      const { name, league_id, status } = league;

      // Only add leagues that are in operation
      if (status !== "pre_draft") {
        rosterSet.league_id = league_id;
        rosterSet.name = name;
        leagues.push(rosterSet);
      }
    }

    return leagues;
  } catch (error) {
    console.error(error.message);
  }
};

/**
 * Takes a set or rosters, and does required transformations to them.
 *
 * @param {Array} rosterSet: a set of "rosters" from a "league"
 * @param {Array} fantasyCalcData: data about each players value
 */
export const transformData = (rosterSet, fantasyCalcData) => {
  rosterSet.maxTeamValue = 0;
  rosterSet.minTeamValue = 0;

  rosterSet.forEach((roster) => {
    // 1. Assign the fantasy calculator data to each player on the roster
    roster.players = roster.players.flatMap((playerId) => {
      const playerObj = fantasyCalcData.find((p) => p.sleeperId === playerId);
      return playerObj ?? [];
    });

    // 2. Compute the total value of the roster and
    // the total 30 day value trend
    roster.trend30Day = 0;
    roster.totalValue = 0;
    roster.players.forEach((p) => {
      roster.totalValue += p.redraftValue;
      roster.trend30Day += p.trend30Day;
    });

    rosterSet.maxTeamValue = Math.max(
      rosterSet.maxTeamValue,
      roster.totalValue
    );

    rosterSet.minTeamValue = Math.min(
      rosterSet.minTeamValue,
      roster.totalValue
    );
  });

  // 3. Sort rosters in descending order of total value
  rosterSet.sort((a, b) => b.totalValue - a.totalValue);
  return rosterSet;
};
