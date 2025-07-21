import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { id } = params;

  const { data, error } = await supabase
    .from('matches')
    .select('id, challenge_id, status, creator_id, guesser_id')
    .eq('id', id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'match not found' }, { status: 404 });
  }

  return NextResponse.json(data);
}
