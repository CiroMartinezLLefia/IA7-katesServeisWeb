import { db } from "@/lib/db";
import { getTeams } from "@/app/actions/teams";
import { TeamsClient } from "@/components/TeamsClient";

export const revalidate = 0;

export default async function TeamsBackofficePage() {
  const teams = await getTeams();

  return <TeamsClient initialTeams={teams} />;
}
