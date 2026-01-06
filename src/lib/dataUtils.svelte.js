import * as cheerio from "cheerio";

/**
 * Make an api call for player value rankings
 * @returns array of the players
 */
export const getFantasyCalcData = async () => {
  const fantasyCalcRes = await fetch(
    "https://api.fantasycalc.com/values/current?isDynasty=false&numQbs=1&numTeams=10&ppr=1"
  );

  if (!fantasyCalcRes.ok) throw new Error(`Failed to load NFL player data.\nStatus: ${fantasyCalcRes.status}`);
  const originalData = await fantasyCalcRes.json();

  let fantasyCalcData = [];
  originalData.forEach((playerObj) => {
    // Destructure the player object
    // for relevant parts
    const {
      trend30Day,
      redraftValue,
      overallRank,
      player: { sleeperId, mflId, name, position },
    } = playerObj;

    fantasyCalcData.push({
      overallRank,
      name,
      position,
      isSelected: false,
      redraftValue,
      trend30Day,
      sleeperId,
      mflId,
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
export const getUserLeagues = async (username, fantasyCalcData) => {
  const SLEEPER_API = "https://api.sleeper.app/v1";

  try {
    // Load the user object, throw on errors
    const userDataRes = await fetch(SLEEPER_API + `/user/${username}`);
    if (!userDataRes.ok) throw new Error(`Status code: ${userDataRes.status}`);
    const userData = await userDataRes.json();
    if (!userData) throw new Error(`This user does not exist.`);

    // Get the league IDs for the user, throw on errors
    const leagueIDSRes = await fetch(SLEEPER_API + `/user/${userData.user_id}/leagues/nfl/2025`);
    if (!leagueIDSRes.ok) throw new Error(`Status code: ${leagueIDSRes.status}`);
    const leagueIDS = await leagueIDSRes.json();
    if (!leagueIDS || leagueIDS.length === 0) throw new Error(`No leagues exist for this user.`);

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
        leagues.push({ rosterSet, league_id, name });
      }
    }

    // Transform each league into the required structure before returning
    return leagues.map((league) => transformLeague(league, fantasyCalcData));
  } catch (error) {
    console.error(error.message);
    throw new Error(`League request for '${username}' failed.\n${error.message}`);
  }
};

/**
 * Takes the given league and does required transformations to it.
 *
 * @param {Object} league: { rosterSet: Array, league_id: string, name: string }
 * @param {Array} fantasyCalcData: relevant data about each player in the NFL
 *
 * @returns An object that encapsulates the required information for a "league"
 */
const transformLeague = (league, fantasyCalcData) => {
  let maxTeamValue = 0;

  league.rosterSet.forEach((roster) => {
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

    maxTeamValue = Math.max(maxTeamValue, roster.totalValue);
  });

  // 3. Sort rosters in descending order of total value
  league.rosterSet.sort((a, b) => b.totalValue - a.totalValue);

  return {
    rosters: league.rosterSet,
    maxTeamValue,
    leagueID: league.league_id,
    name: league.name,
  };
};


export const getWeeklyRankings = async (fantasyCalcData) => {

  // (l=16 corresponds to Draft Kings projections)
  const fantasySharksRes = await fetch(
    "https://www.fantasysharks.com/apps/Projections/WeeklyProjections.php?pos=ALL&format=json&l=16"
  );

  if (!fantasySharksRes.ok) throw new Error(`Failed to load weekly rankings.\nStatus: ${fantasySharksRes.status}`);

  let data = await fantasySharksRes.json();

  // Add the sleeper ID to each player in the weekly rankings
  data.forEach((player) => {
    let fcdPlayer = fantasyCalcData.find((p) => p.mflId === player.ID);
    if (fcdPlayer) player.sleeperId = fcdPlayer.sleeperId;
  });

  // Remove any players that have an extremely poor projection
  data = data.filter((player) => player.FantasyPoints > 3);

  // Try to scrape the "Last Updated" time from the actual website
  const res = await fetch(
    "https://www.fantasysharks.com/apps/Projections/WeeklyProjections.php",
    {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "text/html"
      }
    }
  );

  let lastUpdated = "unknown";
  
  if (res.ok){
    const html = await res.text();
    const dom = cheerio.load(html);
    lastUpdated = dom("small")
      .filter((_, el) => dom(el).find("b").text().trim() === "Updated:")
      .text()
      .replace("Updated:", "")
      .trim();
  }

  return {data, lastUpdated};
  /* example player from the data array
  {
    Rank: 1,
    ID: "13589",
    Name: "Allen, Josh",
    Pos: "QB",
    Team: "BUF",
    Opp: "NYJ",
    Comp: "20.14",
    PassYards: "239",
    PassTD: 2.0099999999999998,
    Int: "0.52",
    Att: "6.03",
    RushYards: "30",
    RushTD: 0.88000000000000012,
    Rec: "0",
    RecYards: "0",
    RecTD: 0,
    FantasyPoints: 27,
  };
*/
};

export const getLeagueMatchup = async (leagueID, week) => {
  const matchupsRes = await fetch(
    `https://api.sleeper.app/v1/league/${leagueID}/matchups/${week}`
  );

  if (!matchupsRes.ok) throw new Error(`Status code: ${matchupsRes.status}`);

  const matchups = await matchupsRes.json();
  let matchupPairsObject = Object.groupBy(
    matchups,
    ({ matchup_id }) => matchup_id
  );
  
  let matchupPairsArray = Object.values(matchupPairsObject);
  return matchupPairsArray;
}
