"use server";

import { db } from "@/lib/db";
import { teamSchema } from "@/lib/schemas";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// Helper to verify role authorization
async function requireEditorOrAdmin() {
  const session = await getServerSession(authOptions);
  if (
    !session ||
    !session.user ||
    (session.user.role !== "EDITOR" && session.user.role !== "ADMIN")
  ) {
    throw new Error("No teniu autorització per realitzar aquesta acció.");
  }
  return session.user;
}

// Get all teams ordered by name
export async function getTeams() {
  try {
    return await db.team.findMany({
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.error("Error fetching teams:", error);
    return [];
  }
}

// Create a new team
export async function createTeam(data: any) {
  await requireEditorOrAdmin();

  const validated = teamSchema.safeParse(data);
  if (!validated.success) {
    return { success: false, error: validated.error.flatten().fieldErrors };
  }

  try {
    const existing = await db.team.findUnique({
      where: { name: validated.data.name },
    });

    if (existing) {
      return { success: false, error: { name: ["Aquest equip ja existeix."] } };
    }

    const team = await db.team.create({
      data: {
        name: validated.data.name,
        country: validated.data.country,
        shieldUrl: validated.data.shieldUrl || "",
      },
    });

    revalidatePath("/teams");
    revalidatePath("/backoffice/teams");
    return { success: true, team };
  } catch (error: any) {
    return { success: false, error: { _form: [error.message || "Error al crear l'equip."] } };
  }
}

// Update a team
export async function updateTeam(id: string, data: any) {
  await requireEditorOrAdmin();

  const validated = teamSchema.safeParse(data);
  if (!validated.success) {
    return { success: false, error: validated.error.flatten().fieldErrors };
  }

  try {
    const existing = await db.team.findFirst({
      where: {
        name: validated.data.name,
        id: { not: id },
      },
    });

    if (existing) {
      return { success: false, error: { name: ["Un altre equip ja té aquest nom."] } };
    }

    const team = await db.team.update({
      where: { id },
      data: {
        name: validated.data.name,
        country: validated.data.country,
        shieldUrl: validated.data.shieldUrl,
      },
    });

    revalidatePath("/teams");
    revalidatePath("/backoffice/teams");
    return { success: true, team };
  } catch (error: any) {
    return { success: false, error: { _form: [error.message || "Error al modificar l'equip."] } };
  }
}

// Delete a team
export async function deleteTeam(id: string) {
  await requireEditorOrAdmin();

  try {
    await db.team.delete({
      where: { id },
    });

    revalidatePath("/teams");
    revalidatePath("/backoffice/teams");
    revalidatePath("/matches");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Error al eliminar l'equip." };
  }
}
