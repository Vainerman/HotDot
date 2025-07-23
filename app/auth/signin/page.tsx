'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { Button } from '@/components/ui/button'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [otp, setOtp] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    if (!email) {
      setError('Please enter your email address.')
      return
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
      })

      if (error) {
        setError(error.message)
      } else {
        setSubmitted(true)
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.')
    }
  }

  const verifyCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    if (!otp) {
      setError('Please enter the code from your email.')
      return
    }
    setVerifying(true)
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email',
    })
    setVerifying(false)
    if (error) {
      setError(error.message)
    } else {
      window.location.href = '/'
    }
  }

  const resendCode = async () => {
    setError('')
    await supabase.auth.signInWithOtp({ email })
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#F4F1E9] text-center p-4 font-sans">
        <h1 className="text-2xl font-bold mb-4">Enter code</h1>
        <p className="mb-4">We've sent a 6-digit code to <strong>{email}</strong>.</p>
        <form onSubmit={verifyCode} className="space-y-6">
          <InputOTP maxLength={6} value={otp} onChange={(val) => setOtp(val)}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
          <Button
            type="submit"
            disabled={verifying}
            variant="primaryCta"
            className="w-full"
          >
            {verifying ? 'VERIFYING...' : 'VERIFY'}
          </Button>
        </form>
        <button
          onClick={resendCode}
          className="mt-4 text-sm text-[#FF6338] hover:text-[#C9330A]"
        >
          Resend code
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F4F1E9] font-sans">
      <div className="w-full max-w-sm p-8 space-y-6">
        <h1 className="text-2xl font-bold text-center">Sign In</h1>
        <p className="text-center text-gray-600">Enter your email to get a code:</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="you@example.com"
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <div>
            <Button
              type="submit"
              variant="primaryCta"
              className="w-full"
            >
              ENTER
            </Button>
          </div>
        </form>
        <p className="text-center text-xs text-gray-500">
           <a href="/" className="font-medium text-[#FF6338] hover:text-[#C9330A]">
            back
          </a>
        </p>
      </div>
    </div>
  )
}
