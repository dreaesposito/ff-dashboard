/* Utility functions */
import { getWeeklyRankings, getFantasyCalcData } from "$lib/dataUtils.svelte.js";

export async function load() {
  const fantasyCalcData = await getFantasyCalcData();
  const {data: weeklyRankings, lastUpdated} = await getWeeklyRankings(fantasyCalcData);
  return { weeklyRankings, lastUpdated };
}
