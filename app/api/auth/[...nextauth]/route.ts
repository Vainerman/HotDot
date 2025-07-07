import NextAuth from "next-auth"
import EmailProvider from "next-auth/providers/email"
import { SupabaseAdapter } from "@next-auth/supabase-adapter"

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL")
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY")
}
if (!process.env.EMAIL_SERVER_HOST) {
    throw new Error("Missing EMAIL_SERVER_HOST");
}
if (!process.env.EMAIL_SERVER_PORT) {
    throw new Error("Missing EMAIL_SERVER_PORT");
}
if (!process.env.EMAIL_SERVER_USER) {
    throw new Error("Missing EMAIL_SERVER_USER");
}
if (!process.env.EMAIL_SERVER_PASSWORD) {
    throw new Error("Missing EMAIL_SERVER_PASSWORD");
}
if (!process.env.EMAIL_FROM) {
    throw new Error("Missing EMAIL_FROM");
}

export const authOptions = {
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
  ],
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY,
  }),
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST } 