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
          let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
      
          if (options.maxAge) {
            cookieString += `; max-age=${options.maxAge}`;
          }
          if (options.path) {
            cookieString += `; path=${options.path}`;
          }
          if (options.domain) {
            cookieString += `; domain=${options.domain}`;
          }
          if (options.sameSite) {
            cookieString += `; samesite=${options.sameSite}`;
          }
          if (options.secure) {
            cookieString += `; secure`;
          }
      
          document.cookie = cookieString;
        },
        remove(name: string, options: CookieOptions) {
          let cookieString = `${encodeURIComponent(name)}=; max-age=0`;

          if (options.path) {
            cookieString += `; path=${options.path}`;
          }
          if (options.domain) {
            cookieString += `; domain=${options.domain}`;
          }
          if (options.sameSite) {
            cookieString += `; samesite=${options.sameSite}`;
          }
          if (options.secure) {
            cookieString += `; secure`;
          }
      
          document.cookie = cookieString;
        },
      },
    }
  ); 