import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/signin')
  }

  const { data: drawings, error } = await supabase
    .from('drawings')
    .select('id, image_path')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching drawings:', error)
    return <p className="text-center text-red-500">Could not fetch drawings.</p>
  }
  
  const drawingsWithUrls = drawings ? await Promise.all(
    drawings.map(async (drawing) => {
      const { data, error } = await supabase.storage
        .from('drawings')
        .createSignedUrl(drawing.image_path, 60) // Signed URL valid for 1 minute
      if (error) {
        console.error('Error creating signed URL for', drawing.image_path, error)
        return { ...drawing, signedUrl: '/placeholder.svg' } // Fallback image
      }
      return { ...drawing, signedUrl: data.signedUrl }
    })
  ) : []

  return (
    <div className="container mx-auto p-4">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Gallery</h1>
        <Link href="/" className="hover:text-[#FF5C38] transition-colors">Back to Home</Link>
      </header>
      {drawingsWithUrls.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {drawingsWithUrls.map((drawing) => (
            <div key={drawing.id} className="aspect-square bg-gray-200 rounded-lg overflow-hidden shadow-lg relative">
              <Image
                src={drawing.signedUrl}
                alt="User drawing"
                layout="fill"
                objectFit="contain"
                className="hover:scale-105 transition-transform duration-300 p-2"
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
            <p className="text-lg">You haven't saved any drawings yet.</p>
            <Link href="/solo-play" className="mt-4 inline-block bg-[#FF6338] text-black hover:bg-[#C9330A] font-sans px-6 py-2 rounded-md transition-colors">
                Create your first drawing!
            </Link>
        </div>
      )}
    </div>
  )
} 