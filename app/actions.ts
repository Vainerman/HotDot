"use server";

import { createClient as createServerClient } from "@/utils/supabase/server";
import { createClient } from "@/utils/supabase/client";
import { v4 as uuidv4 } from 'uuid';

export async function saveDrawing(svgContent: string, title?: string) {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'User not authenticated' };
    }

    const drawingId = uuidv4();
    const filePath = `${user.id}/${drawingId}.svg`;

    const { error: uploadError } = await supabase.storage
        .from('drawings')
        .upload(filePath, svgContent, {
            contentType: 'image/svg+xml',
        });

    if (uploadError) {
        console.error('Error uploading drawing:', uploadError);
        return { success: false, error: uploadError.message };
    }
    
    let width = null;
    let height = null;
    const viewBoxMatch = svgContent.match(/viewBox="([^"]*)"/);
    if (viewBoxMatch) {
        const parts = viewBoxMatch[1].split(' ');
        if (parts.length === 4) {
            width = parseFloat(parts[2]);
            height = parseFloat(parts[3]);
        }
    }

    const { data: insertData, error: dbError } = await supabase.from('drawings').insert({
        user_id: user.id,
        image_path: filePath,
        title: title || 'Untitled Drawing',
        width,
        height,
    }).select('id').single();

    if (dbError) {
        console.error('Error saving drawing to db:', dbError);
        // Rollback storage upload if db insert fails
        await supabase.storage.from('drawings').remove([filePath]);
        return { success: false, error: dbError.message };
    }

    return { success: true, drawingId: insertData.id };
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