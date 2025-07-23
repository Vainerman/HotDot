"use client"

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import type { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { updateDisplayName } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function HeaderAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        setDisplayName(user.user_metadata.display_name ?? user.email ?? '');
      }
      setLoading(false);
    };

    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        setDisplayName(currentUser.user_metadata.display_name ?? currentUser.email ?? '');
      } else {
        setDisplayName('');
      }
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

  const handleSave = async () => {
    const result = await updateDisplayName(displayName);
    if (result.success && result.user) {
      setUser(result.user);
      setDisplayName(result.user.user_metadata.display_name ?? result.user.email ?? '');
      setIsEditing(false);
    } else {
      // Handle error, maybe show a toast
      console.error(result.error);
    }
  };

  if (loading) {
    return <div className="text-sm">...</div>;
  }

  return (
    <>
      {user ? (
        <div className="flex items-center space-x-4">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="text-sm bg-transparent border-b border-gray-500 focus:outline-none"
                autoFocus
              />
              <Button onClick={handleSave} size="sm" variant="primaryCta">Save</Button>
            </div>
          ) : (
            <span className="text-sm cursor-pointer" onClick={() => setIsEditing(true)}>
              {displayName}
            </span>
          )}
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
