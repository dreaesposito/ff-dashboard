import { error } from "@sveltejs/kit";
import { getLeagueMatchup } from "$lib/dataUtils.svelte.js";

export async function load({ params }) {
  try {
    const matchupPairsArray = await getLeagueMatchup(params.leagueID, "1");
    return { matchupPairsArray, leagueID: params.leagueID };
  } catch (err) {
    error(404, { message: `Sleeper league with ID '${params.leagueID}' does not exist.` });
  }
}
