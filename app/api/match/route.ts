
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { action, challengeId } = await request.json();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  switch (action) {
    case 'create':
      if (!challengeId) {
        return NextResponse.json({ error: 'Challenge ID is required' }, { status: 400 });
      }
      const { data: match, error: createError } = await supabase
        .from('matches')
        .insert({
          challenge_id: challengeId,
          creator_id: user.id,
          status: 'waiting',
        })
        .select('id')
        .single();
      if (createError) {
        console.error('Error creating match:', createError);
        return NextResponse.json({ error: 'Failed to create match' }, { status: 500 });
      }
      return NextResponse.json({ matchId: match.id });

    case 'join':
      const { data: availableMatch, error: findError } = await supabase
        .from('matches')
        .select('id, creator_id')
        .eq('status', 'waiting')
        .neq('creator_id', user.id)
        .order('created_at', { ascending: true })
        .limit(1)
        .single();
      
      if (findError || !availableMatch) {
        return NextResponse.json({ error: 'No available matches' }, { status: 404 });
      }

      if (availableMatch.creator_id === user.id) {
        return NextResponse.json({ error: 'You cannot join your own match' }, { status: 400 });
      }

      const { data: updatedMatch, error: updateError } = await supabase
        .from('matches')
        .update({ guesser_id: user.id, status: 'active' })
        .eq('id', availableMatch.id)
        .select('id')
        .single();
      
      if (updateError) {
        console.error('Error joining match:', updateError);
        return NextResponse.json({ error: 'Failed to join match' }, { status: 500 });
      }
      
      // Notify creator that a guesser has joined
      await supabase.channel(`match-${updatedMatch.id}`).send({
        type: 'broadcast',
        event: 'guesser-joined',
        payload: { matchId: updatedMatch.id },
      });

      return NextResponse.json({ matchId: updatedMatch.id });

    default:
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }
} 