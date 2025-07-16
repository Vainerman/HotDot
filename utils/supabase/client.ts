import { createBrowserClient, type CookieOptions } from '@supabase/ssr'

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const cookieStore = document.cookie.split('; ');
          const cookie = cookieStore.find(row => row.startsWith(`${name}=`));
          return cookie ? cookie.split('=')[1] : undefined;
        },
        set(name: string, value: string, options: CookieOptions) {
          document.cookie = `${name}=${value}; path=/;`;
        },
        remove(name: string, options: CookieOptions) {
          document.cookie = `${name}=; path=/; max-age=0;`;
        },
      },
    }
  ); 