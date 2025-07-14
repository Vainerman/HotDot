"use client"

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import type { User } from '@supabase/supabase-js';
import Link from 'next/link';

export default function HeaderAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (loading) {
    return <div className="text-sm">...</div>;
  }

  return (
    <>
      {user ? (
        <div className="flex items-center space-x-4">
          <span className="text-sm">{user.email}</span>
          <button
            onClick={handleSignOut}
            className="hover:text-[#FF5C38] transition-colors"
          >
            SIGN OUT
          </button>
        </div>
      ) : (
        <Link href="/auth/signin" className="hover:text-[#FF5C38] transition-colors">
          SIGN IN
        </Link>
      )}
    </>
  );
}
