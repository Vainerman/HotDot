import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'

interface Attempt {
  id: string
  created_at: string
  feedback?: boolean | null
}

interface Challenge {
  id: string
  created_at: string
  attempts?: Attempt[]
}

export default async function ChallengesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/signin')
  }

  const { data: challenges, error } = await supabase
    .from('challenges')
    .select('id, created_at, attempts(id, created_at, feedback)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching challenges:', error)
    return <p className="text-center text-red-500">Could not fetch challenges.</p>
  }

  return (
    <div className="container mx-auto p-4">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Challenges</h1>
        <Link href="/" className="hover:text-[#FF5C38] transition-colors">
          Back to Home
        </Link>
      </header>
      {challenges && challenges.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Challenge</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Attempts</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(challenges as Challenge[]).map(challenge => (
              <TableRow key={challenge.id}>
                <TableCell className="align-top">{challenge.id}</TableCell>
                <TableCell className="align-top">
                  {new Date(challenge.created_at).toLocaleString()}
                </TableCell>
                <TableCell>
                  {challenge.attempts && challenge.attempts.length > 0 ? (
                    <Table className="w-full">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Attempt</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Feedback</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {challenge.attempts.map(attempt => (
                          <TableRow key={attempt.id}>
                            <TableCell>{attempt.id}</TableCell>
                            <TableCell>
                              {new Date(attempt.created_at).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              {attempt.feedback ? (
                                'Received'
                              ) : (
                                <Link
                                  href={`/feedback/${attempt.id}`}
                                  className="text-blue-600 underline"
                                >
                                  Give Feedback
                                </Link>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <span>No attempts yet</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="text-center">You haven't created any challenges yet.</p>
      )}
    </div>
  )
}
