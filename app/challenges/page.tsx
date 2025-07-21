'use client'

import { createClient } from '@/utils/supabase/client'
import { redirect, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import AnimatedSvg from '@/components/animated-svg'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { createChallenge } from '@/app/actions'

interface Drawing {
  id: string
  signedUrl: string
}

interface User {
  id: string;
}

export default function ChallengesPage() {
  const supabase = createClient()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [drawings, setDrawings] = useState<Drawing[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDrawingId, setSelectedDrawingId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false);


  useEffect(() => {
    const getUserAndDrawings = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session?.user) {
        redirect('/auth/signin')
        return
      }
      
      setUser(session.user as User)

      const { data: drawingsData, error } = await supabase
        .from('drawings')
        .select('id, image_path')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching drawings:', error)
        setLoading(false)
        return
      }

      if (drawingsData) {
        const drawingsWithUrls = (
          await Promise.all(
            drawingsData.map(async drawing => {
              const { data, error } = await supabase.storage
                .from('drawings')
                .createSignedUrl(drawing.image_path, 60) // 1 minute expiry

              if (error) {
                console.error('Error creating signed URL:', error)
                return null
              }
              return { id: drawing.id, signedUrl: data.signedUrl }
            })
          )
        ).filter(Boolean) as Drawing[]
        setDrawings(drawingsWithUrls)
      }
      setLoading(false)
    }

    getUserAndDrawings()
  }, [supabase])

  const handleCreateChallenge = async (drawingId: string) => {
    if (!user) return;
    setIsCreating(true);

    // 1. Create a match to get an ID
    const matchResponse = await fetch('/api/match/create', { method: 'POST' });
    const { id: matchId, error: matchError } = await matchResponse.json();

    if (matchError) {
      console.error('Failed to create match:', matchError);
      alert('Could not create challenge. Please try again.');
      setIsCreating(false);
      return;
    }

    // 2. Navigate immediately
    router.push(`/match/waiting/${matchId}`);

    // 3. Create challenge and update match in the background
    (async () => {
        // If no challenge exists, create a new one
        const { data: newChallenge, error: createError } = await supabase
            .from('challenges')
            .insert({ drawing_id: drawingId, user_id: user.id })
            .select('id')
            .single();

        if (createError) {
            console.error('Error creating challenge:', createError);
              await fetch(`/api/match/${matchId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'failed' }),
            });
            return;
        }
        
        const challengeId = newChallenge.id;
        
        if (challengeId) {
            const updateResponse = await fetch(`/api/match/${matchId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ challenge_id: challengeId, status: 'waiting' }),
            });

            if (!updateResponse.ok) {
                const { error } = await updateResponse.json();
                console.error('Failed to update match:', error);
            }
        }
    })();
  };

  if (loading) {
    return <p className="text-center">Loading your drawings...</p>
  }

  return (
    <div className="container mx-auto p-4">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Create a Challenge</h1>
        <Link href="/">
          <Image
            src="/assets/Back_Button.svg"
            alt="Back to Home"
            width={41}
            height={41}
            className="transition-transform hover:scale-110"
          />
        </Link>
      </header>
      {drawings.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {drawings.map(drawing => (
            <div
              key={drawing.id}
              className="aspect-square rounded-lg overflow-hidden relative flex items-center justify-center cursor-pointer"
              onClick={() => setSelectedDrawingId(drawing.id)}
            >
              <AnimatedSvg svgUrl={drawing.signedUrl} />
              {selectedDrawingId === drawing.id && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center" onClick={() => setSelectedDrawingId(null)}>
                  <Button
                    onClick={e => {
                      e.stopPropagation()
                      handleCreateChallenge(drawing.id)
                    }}
                    disabled={isCreating}
                    className="bg-[#FF6338] text-black hover:bg-[#C9330A] font-sans px-6 py-2 rounded-md transition-colors"
                  >
                    {isCreating ? 'Creating...' : 'Create Challenge'}
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-lg">You haven't created any drawings yet.</p>
          <Link
            href="/solo-play"
            className="mt-4 inline-block bg-[#FF6338] text-black hover:bg-[#C9330A] font-sans px-6 py-2 rounded-md transition-colors"
          >
            Create a drawing to make a challenge!
          </Link>
        </div>
      )}
    </div>
  )
}
