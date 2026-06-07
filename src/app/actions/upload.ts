"use server";

import { uploadFile } from "@/lib/supabase";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function uploadAssetAction(formData: FormData) {
  const session = await getServerSession(authOptions);
  
  // Verify user is authenticated and is an EDITOR or ADMIN
  if (
    !session ||
    !session.user ||
    (session.user.role !== "EDITOR" && session.user.role !== "ADMIN")
  ) {
    return { success: false, error: "No teniu autorització per penjar fitxers." };
  }

  const file = formData.get("file") as File;
  const bucket = (formData.get("bucket") as string) || "matches";

  if (!file || file.size === 0) {
    return { success: false, error: "No s'ha proporcionat cap fitxer." };
  }

  try {
    const url = await uploadFile(bucket, file);
    return { success: true, url };
  } catch (error: any) {
    return { success: false, error: error.message || "Error al penjar el fitxer." };
  }
}
