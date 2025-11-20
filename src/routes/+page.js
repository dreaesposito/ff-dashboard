import { error } from "@sveltejs/kit";

const FANTASY_CALC_URL =
  "https://api.fantasycalc.com/values/current?isDynasty=false&numQbs=1&numTeams=10&ppr=1";

/** @type {import('./$types').PageLoad} */
export async function load({ fetch }) {
  const resFantasyCalc = await fetch(FANTASY_CALC_URL);
  let fantasyCalcData = resFantasyCalc.ok ? await resFantasyCalc.json() : [];

  fantasyCalcData = fantasyCalcData.map((playerObj) => {
    return { ...playerObj, isSelected: false };
  });

  return { fantasyCalcData };
}
