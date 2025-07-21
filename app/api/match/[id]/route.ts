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

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { id } = params;
  const { challenge_id, status } = await request.json();

  const { data, error } = await supabase
    .from('matches')
    .update({ challenge_id, status })
    .eq('id', id)
    .select('id')
    .single();
  
  if (error || !data) {
    return NextResponse.json({ error: 'failed to update match' }, { status: 500 });
  }

  return NextResponse.json({ id: data.id });
}
