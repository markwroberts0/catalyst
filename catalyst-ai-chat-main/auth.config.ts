import type { NextAuthConfig } from 'next-auth'
import Google from "next-auth/providers/google"


export const authConfig = {
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: "/login",
    newUser: "/signup",
  },
  providers: [Google]
} satisfies NextAuthConfig