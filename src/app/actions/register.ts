"use server";

import { db } from "@/lib/db";
import * as bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(1, "El nom és obligatori."),
  email: z.string().email("Correu electrònic no vàlid."),
  password: z.string().min(6, "La contrasenya ha de tenir almenys 6 caràcters."),
});

export async function registerUser(data: any) {
  const validated = registerSchema.safeParse(data);
  if (!validated.success) {
    return { success: false, error: validated.error.flatten().fieldErrors };
  }

  try {
    const emailLower = validated.data.email.toLowerCase().trim();
    
    // Check if the user already exists
    const existing = await db.user.findUnique({
      where: { email: emailLower },
    });

    if (existing) {
      return { success: false, error: { email: ["Aquest correu electrònic ja està registrat."] } };
    }

    // Hash password
    const passwordHash = await bcrypt.hash(validated.data.password, 10);

    // Create user
    await db.user.create({
      data: {
        name: validated.data.name,
        email: emailLower,
        passwordHash,
        role: "USER", // Default role
      },
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: { _form: [error.message || "Error al registrar l'usuari."] } };
  }
}
