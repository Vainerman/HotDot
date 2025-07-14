"use server";

import { createClient } from "@/utils/supabase/server";
import { v4 as uuidv4 } from 'uuid';

export async function saveDrawing(svgString: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error("Save drawing attempt by an unauthenticated user.");
    return { success: false, error: "User not authenticated" };
  }

  // The input is a raw SVG string, so we can convert it directly to a buffer.
  const imageBuffer = Buffer.from(svgString, 'utf8');
  const filePath = `${user.id}/${uuidv4()}.svg`;

  // Upload to storage
  const { error: storageError } = await supabase.storage
    .from("drawings")
    .upload(filePath, imageBuffer, {
      contentType: 'image/svg+xml',
    });

  if (storageError) {
    console.error("Storage error:", storageError);
    return { error: "Failed to save drawing to storage." };
  }

  // Save metadata to database
  const { error: dbError } = await supabase.from("drawings").insert({
    user_id: user.id,
    image_path: filePath,
    // Add other fields as necessary, e.g., title, width, height
  });

  if (dbError) {
    console.error("Database error:", dbError);
    // Optionally, delete the uploaded file if the db insert fails
    await supabase.storage.from("drawings").remove([filePath]);
    return { error: "Failed to save drawing metadata." };
  }

  return { success: true, path: filePath };
}
