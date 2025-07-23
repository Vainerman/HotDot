import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  // 1. Find an available match.
  const { data: availableMatches, error: findError } = await supabase
    .from('matches')
    .select('id')
    .eq('status', 'waiting')
    .is('guesser_id', null)
    .order('created_at', { ascending: true })
    .limit(1);

  if (findError) {
    console.error("Error finding matches:", findError);
    return NextResponse.json({ error: 'failed to query matches' }, { status: 500 });
  }

  if (!availableMatches || availableMatches.length === 0) {
    return NextResponse.json({ error: 'no match available' }, { status: 404 });
  }

  const matchToJoin = availableMatches[0];

  // 2. Attempt to join the match using the RPC.
  const { data: joinedMatch, error: joinError } = await supabase.rpc('join_match', {
    match_id_to_join: matchToJoin.id
  });

  if (joinError) {
    console.error('Error joining match:', joinError.message);
    // This could happen if another user joined the match in the time it took to call the RPC.
    // The client will poll again, so we can return a 404.
    return NextResponse.json({ error: 'failed to join match, maybe it was taken' }, { status: 404 });
  }

  // 3. Notify the creator that a guesser has joined.
  const channel = supabase.channel(`match-${matchToJoin.id}`);
  await channel.subscribe();
  await channel.send({
    type: 'broadcast',
    event: 'guesser-joined',
    payload: { guesserId: user.id },
  });
  await supabase.removeChannel(channel);


  return NextResponse.json(joinedMatch[0]);
}
