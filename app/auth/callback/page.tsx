'use client';

import { useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function AuthCallbackPage() {
  
  useEffect(() => {
    // By creating a Supabase client on this page, the library will automatically
    // handle the auth token from the URL, complete the sign-in, and set the
    // session cookie. This will trigger the onAuthStateChange listener on the
    // original sign-in page.
    const supabase = createClient();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F4F1E9] text-center p-4 font-sans">
      <h1 className="text-2xl font-bold mb-4">Successfully Authenticated!</h1>
      <p className="mb-4">You can now close this tab and return to the original sign-in page.</p>
      <p className="text-sm text-gray-600">(It should redirect automatically.)</p>
    </div>
  );
} 