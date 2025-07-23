import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  const { data: matches, error } = await supabase
    .from('matches')
    .select('id, challenge_id')
    .eq('status', 'waiting')
    .order('created_at', { ascending: true })
    .limit(1);

  if (error) {
    console.error("Error fetching matches:", error);
    return NextResponse.json({ error: 'failed to query matches' }, { status: 500 });
  }

  if (!matches || matches.length === 0) {
    return NextResponse.json({ error: 'no match available' }, { status: 404 });
  }

  const matchData = matches[0];

  const { error: updateError } = await supabase
    .from('matches')
    .update({ guesser_id: user.id, status: 'active' })
    .eq('id', matchData.id);

  if (updateError) {
    return NextResponse.json({ error: 'failed to join match' }, { status: 500 });
  }

  return NextResponse.json({ id: matchData.id, challengeId: matchData.challenge_id });
}
