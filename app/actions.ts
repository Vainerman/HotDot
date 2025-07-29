"use server";

import { createClient as createServerClient } from "@/utils/supabase/server";
import { createClient } from "@/utils/supabase/client";
import { v4 as uuidv4 } from 'uuid';

export async function saveDrawing(svgContent: string, title?: string) {
    // Debug logging for troubleshooting
    console.log('SaveDrawing called with:', {
        svgContentLength: svgContent?.length || 0,
        title: title || 'Untitled Drawing',
        timestamp: new Date().toISOString()
    });

    // Input validation
    if (!svgContent || svgContent.trim().length === 0) {
        console.warn('SaveDrawing failed: Drawing content is empty');
        return { success: false, error: 'Drawing content is empty' };
    }

    // Basic SVG validation - check if it contains actual drawing paths
    if (!svgContent.includes('<path') && !svgContent.includes('<g')) {
        console.warn('SaveDrawing failed: Drawing appears to be empty (no paths or groups)');
        return { success: false, error: 'Drawing appears to be empty. Please draw something before saving.' };
    }

    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        console.warn('SaveDrawing failed: User not authenticated');
        return { success: false, error: 'User not authenticated' };
    }

    console.log('SaveDrawing: User authenticated', { userId: user.id });

    const drawingId = uuidv4();
    const filePath = `${user.id}/${drawingId}.svg`;

    // Additional validation: check SVG size isn't too large (prevent abuse)
    if (svgContent.length > 1024 * 1024) { // 1MB limit
        console.warn('SaveDrawing failed: Drawing too large', { size: svgContent.length });
        return { success: false, error: 'Drawing is too large to save' };
    }

    const { error: uploadError } = await supabase.storage
        .from('drawings')
        .upload(filePath, svgContent, {
            contentType: 'image/svg+xml',
        });

    if (uploadError) {
        console.error('Error uploading drawing:', uploadError);
        // More specific error messages based on error type
        if (uploadError.message.includes('Bucket not found')) {
            return { success: false, error: 'Storage configuration error. Please try again later.' };
        }
        if (uploadError.message.includes('Permission denied')) {
            return { success: false, error: 'Permission denied. Please sign in again.' };
        }
        return { success: false, error: `Upload failed: ${uploadError.message}` };
    }
    
    console.log('SaveDrawing: Storage upload successful', { filePath });
    
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
        
        // More specific error messages
        if (dbError.message.includes('violates row-level security policy')) {
            return { success: false, error: 'Permission denied. Please sign in again.' };
        }
        return { success: false, error: `Failed to save drawing: ${dbError.message}` };
    }

    console.log('SaveDrawing: Database insert successful', { drawingId: insertData.id });
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