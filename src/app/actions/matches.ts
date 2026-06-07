"use server";

import { db } from "@/lib/db";
import { matchSchema } from "@/lib/schemas";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

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

// Fetch all matches ordered by date desc
export async function getMatches() {
  try {
    return await db.match.findMany({
      include: {
        homeTeam: true,
        awayTeam: true,
      },
      orderBy: { date: "desc" },
    });
  } catch (error) {
    console.error("Error fetching matches:", error);
    return [];
  }
}

// Fetch a single match by ID
export async function getMatchById(id: string) {
  try {
    return await db.match.findUnique({
      where: { id },
      include: {
        homeTeam: true,
        awayTeam: true,
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  } catch (error) {
    console.error("Error fetching match by ID:", error);
    return null;
  }
}

// Create a match
export async function createMatch(data: any) {
  await requireEditorOrAdmin();

  const validated = matchSchema.safeParse(data);
  if (!validated.success) {
    return { success: false, error: validated.error.flatten().fieldErrors };
  }

  try {
    const match = await db.match.create({
      data: {
        homeTeamId: validated.data.homeTeamId,
        awayTeamId: validated.data.awayTeamId,
        homeScore: validated.data.homeScore ?? null,
        awayScore: validated.data.awayScore ?? null,
        date: new Date(validated.data.date),
        status: validated.data.status,
        imageUrl: validated.data.imageUrl || "",
      },
    });

    revalidatePath("/matches");
    revalidatePath(`/matches/${match.id}`);
    revalidatePath("/backoffice/matches");
    return { success: true, match };
  } catch (error: any) {
    return { success: false, error: { _form: [error.message || "Error al crear el partit."] } };
  }
}

// Update a match
export async function updateMatch(id: string, data: any) {
  await requireEditorOrAdmin();

  const validated = matchSchema.safeParse(data);
  if (!validated.success) {
    return { success: false, error: validated.error.flatten().fieldErrors };
  }

  try {
    const match = await db.match.update({
      where: { id },
      data: {
        homeTeamId: validated.data.homeTeamId,
        awayTeamId: validated.data.awayTeamId,
        homeScore: validated.data.homeScore ?? null,
        awayScore: validated.data.awayScore ?? null,
        date: new Date(validated.data.date),
        status: validated.data.status,
        imageUrl: validated.data.imageUrl,
      },
    });

    revalidatePath("/matches");
    revalidatePath(`/matches/${id}`);
    revalidatePath("/backoffice/matches");
    return { success: true, match };
  } catch (error: any) {
    return { success: false, error: { _form: [error.message || "Error al modificar el partit."] } };
  }
}

// Delete a match
export async function deleteMatch(id: string) {
  await requireEditorOrAdmin();

  try {
    await db.match.delete({
      where: { id },
    });

    revalidatePath("/matches");
    revalidatePath("/backoffice/matches");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Error al eliminar el partit." };
  }
}
