"use server";

import { createClient as createServerClient } from "@/utils/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from 'uuid';

export async function saveDrawing(svgString: string) {
  const supabase = await createServerClient();

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

export async function updateDisplayName(displayName: string) {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "User not authenticated" };
  }

  const { data, error } = await supabase.auth.updateUser({
    data: { display_name: displayName },
  });

  if (error) {
    console.error("Error updating display name:", error);
    return { success: false, error: "Failed to update display name." };
  }

  return { success: true, user: data.user };
}

export async function createMatchWithChallenge(drawingData: string, templateSvg: string, viewBox: string) {
    const supabase = await createServerClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: "User not authenticated" };
    }

    const creatorName = user.user_metadata?.display_name ?? user.email;

    // Create the match with the challenge data directly
    const { data: matchData, error: matchError } = await supabase
        .from('matches')
        .insert({
            creator_id: user.id,
            creator_name: creatorName,
            status: 'waiting',
            template_svg: templateSvg,
            template_viewbox: viewBox,
            creator_drawing_svg: drawingData,
        })
        .select('id')
        .single();

    if (matchError) {
        console.error("Error creating match:", matchError);
        return { success: false, error: 'failed to create match' };
    }

    return { success: true, matchId: matchData.id };
}

export async function getTodaysDrawingsCount() {
  const supabase = await createServerClient();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { count, error } = await supabase
    .from('drawings')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today.toISOString())
    .lt('created_at', tomorrow.toISOString());

  if (error) {
    console.error('Error fetching todays drawings count:', error);
    return 0;
  }

  return count || 0;
} 