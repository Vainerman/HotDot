'use client'

import { createClient } from '@/utils/supabase/client' // Changed to client
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react' // Added useState and useEffect
import AnimatedSvg from '@/components/animated-svg'
import Image from 'next/image'
import { Button } from '@/components/ui/button' // Added Button
import { useRouter } from 'next/navigation' // Added useRouter

interface Challenge {
  id: string
  template_id: string
  template_image_path: string
  signedUrl: string
}

export default function ChallengesPage() {
  const supabase = createClient()
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(
    null
  )

  useEffect(() => {
    const getUserAndChallenges = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session?.user) {
        redirect('/auth/signin')
        return
      }
      // @ts-ignore
      setUser(session.user)

      const { data: challengesData, error } = await supabase
        .from('challenges')
        .select('id, template:templates(image_path)')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching challenges:', error)
        setLoading(false)
        return
      }

      if (challengesData) {
        const challengesWithUrls = await Promise.all(
          challengesData.map(async challenge => {
            const template = Array.isArray(challenge.template) ? challenge.template[0] : challenge.template;
            const image_path = template?.image_path ?? 'public/assets/templates/1.svg'; // Fallback path

            const { data, error } = await supabase.storage
              .from('drawings') // Assuming templates are also in a bucket, might need to change 'drawings'
              .createSignedUrl(image_path, 60) // Signed URL valid for 1 minute

            if (error) {
              console.error('Error creating signed URL for', image_path, error)
              return {
                ...challenge,
                template_image_path: image_path,
                signedUrl: '/placeholder.svg', // Fallback image
              }
            }
            return {
              ...challenge,
              template_image_path: image_path,
              signedUrl: data.signedUrl,
            }
          })
        )
        // @ts-ignore
        setChallenges(challengesWithUrls)
      }
      setLoading(false)
    }

    getUserAndChallenges()
  }, [supabase])

  const startChallenge = (challengeId: string) => {
    router.push(`/challenge/${challengeId}`)
  }

  if (loading) {
    return <p className="text-center">Loading challenges...</p>
  }

  return (
    <div className="container mx-auto p-4">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Challenges</h1>
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
      {challenges.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {challenges.map(challenge => (
            <div
              key={challenge.id}
              className="aspect-square rounded-lg overflow-hidden relative flex items-center justify-center cursor-pointer"
              onClick={() => setSelectedChallengeId(challenge.id)}
            >
              <AnimatedSvg svgUrl={challenge.signedUrl} />
              {selectedChallengeId === challenge.id && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <Button
                    onClick={e => {
                      e.stopPropagation() // Prevent click from bubbling to the parent div
                      startChallenge(challenge.id)
                    }}
                    className="bg-[#FF6338] text-black hover:bg-[#C9330A] font-sans px-6 py-2 rounded-md transition-colors"
                  >
                    Start Challenge
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-lg">You haven't created any challenges yet.</p>
          <Link
            href="/solo-play"
            className="mt-4 inline-block bg-[#FF6338] text-black hover:bg-[#C9330A] font-sans px-6 py-2 rounded-md transition-colors"
          >
            Create your first drawing!
          </Link>
        </div>
      )}
    </div>
  )
}
