import { getUsers } from "@/app/actions/users";
import { UsersClient } from "@/components/UsersClient";

export const revalidate = 0;

export default async function UsersBackofficePage() {
  const users = await getUsers();

  return <UsersClient initialUsers={users} />;
}
