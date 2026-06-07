import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// We use the service role key on the server to manage storage uploads
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

/**
 * Uploads a file to a specific Supabase storage bucket.
 * Returns the public URL of the uploaded asset.
 * If credentials are missing or the upload fails, it falls back to a mock local URL.
 */
export async function uploadFile(
  bucketName: string,
  file: File,
  prefix: string = ""
): Promise<string> {
  // If credentials are placeholders, fallback to mock path
  if (
    !supabaseUrl ||
    !supabaseServiceKey ||
    supabaseServiceKey.startsWith("placeholder") ||
    supabaseServiceKey === ""
  ) {
    console.warn(`Supabase credentials missing. Mocking upload to bucket: ${bucketName}`);
    return `/mock-images/${bucketName}/${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
  }

  const fileExt = file.name.split(".").pop() || "png";
  const uniqueId = Math.random().toString(36).substring(2, 9);
  const filePath = `${prefix}${Date.now()}_${uniqueId}.${fileExt}`;

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (error) {
      throw error;
    }

    const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
    return data.publicUrl;
  } catch (err) {
    console.error(`Supabase upload failed for bucket ${bucketName}:`, err);
    // Graceful fallback URL
    return `/mock-images/${bucketName}/${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
  }
}
