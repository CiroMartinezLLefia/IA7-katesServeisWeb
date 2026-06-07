"use server";

import { db } from "@/lib/db";
import { userRoleSchema } from "@/lib/schemas";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== "ADMIN") {
    throw new Error("No teniu autorització d'administrador per realitzar aquesta acció.");
  }
  return session.user;
}

// Get all users (ADMIN only)
export async function getUsers() {
  await requireAdmin();

  try {
    return await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

// Update a user's role (ADMIN only)
export async function updateUserRole(userId: string, role: any) {
  const currentAdmin = await requireAdmin();

  // Prevent admin from demoting themselves to avoid lock-out
  if (userId === currentAdmin.id) {
    return { success: false, error: "No podeu canviar el vostre propi rol d'administrador." };
  }

  const validated = userRoleSchema.safeParse({ userId, role });
  if (!validated.success) {
    return { success: false, error: "Rol no vàlid." };
  }

  try {
    const user = await db.user.update({
      where: { id: userId },
      data: {
        role: validated.data.role,
      },
    });

    revalidatePath("/backoffice/users");
    return { success: true, user };
  } catch (error: any) {
    return { success: false, error: error.message || "Error al modificar el rol de l'usuari." };
  }
}
