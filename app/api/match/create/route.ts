import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('matches')
    .insert({ creator_id: user.id, status: 'creating' })
    .select('id')
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message || 'failed to create match' }, { status: 500 });
  }

  return NextResponse.json({ id: data.id });
}
