"use server";

import { db } from "@/lib/db";
import { commentSchema } from "@/lib/schemas";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function addComment(data: any) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return { success: false, error: "Heu d'iniciar sessió per escriure un comentari." };
  }

  const validated = commentSchema.safeParse(data);
  if (!validated.success) {
    return { success: false, error: validated.error.flatten().fieldErrors.content?.[0] || "Dades no vàlides." };
  }

  try {
    const comment = await db.comment.create({
      data: {
        content: validated.data.content,
        matchId: validated.data.matchId,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    revalidatePath(`/matches/${validated.data.matchId}`);
    return { success: true, comment };
  } catch (error: any) {
    return { success: false, error: error.message || "Error al desar el comentari." };
  }
}
