import { getMatches } from "@/app/actions/matches";
import { getTeams } from "@/app/actions/teams";
import { MatchesClient } from "@/components/MatchesClient";

export const revalidate = 0;

export default async function MatchesBackofficePage() {
  const [matches, teams] = await Promise.all([getMatches(), getTeams()]);

  return <MatchesClient initialMatches={matches} teams={teams} />;
}
