import { KENYA_COUNTIES } from "../constants/filters";
import { getCountyTowns, KENYA_TOWNS_BY_COUNTY } from "../constants/kenya-towns";

export type CountyTownSelection = { county: string; town: string };
export const countyOptions = KENYA_COUNTIES.map((county) => ({ value: county, label: county }));

export function inferCounty(town: string): string {
  const matches = KENYA_COUNTIES.filter((county) =>
    getCountyTowns(county).some((candidate) => candidate.toLowerCase() === town.trim().toLowerCase())
  );
  return matches.length === 1 ? matches[0] : "";
}

export function selectCounty(previous: CountyTownSelection, county: string): CountyTownSelection {
  return { county, town: county === previous.county || getCountyTowns(county).includes(previous.town) ? previous.town : "" };
}

export function townOptions(county: string) {
  return (county ? [county] : KENYA_COUNTIES).flatMap((name) =>
    getCountyTowns(name).map((town) => ({
      value: JSON.stringify([name, town]),
      label: county ? town : `${town} (${name})`,
    }))
  );
}

/** Interpret existing single-location links without changing their server semantics. */
export function selectionFromLocation(location: string): CountyTownSelection {
  if (location === "All Locations") return { county: "", town: "" };
  if (Object.hasOwn(KENYA_TOWNS_BY_COUNTY, location)) return { county: location, town: "" };
  return { county: inferCounty(location), town: location };
}
