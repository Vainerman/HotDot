
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  const { data: { user }, error } = await supabase.auth.admin.getUserById(id);

  if (error || !user) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const displayName = user.user_metadata?.display_name ?? user.email;

  return NextResponse.json({ displayName });
} 