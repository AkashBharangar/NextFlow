import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

import { prisma } from "@/lib/prisma";

// Fail fast in production if critical auth secrets are missing.
// This prevents the app from starting with a broken auth config
// which would silently issue unsigned or invalid sessions.
if (process.env.NODE_ENV === "production") {
  if (!process.env.NEXTAUTH_SECRET?.trim()) {
    throw new Error(
      "[auth] NEXTAUTH_SECRET is not set — refusing to start in production",
    );
  }
  if (!process.env.GOOGLE_CLIENT_ID?.trim()) {
    throw new Error(
      "[auth] GOOGLE_CLIENT_ID is not set — refusing to start in production",
    );
  }
  if (!process.env.GOOGLE_CLIENT_SECRET?.trim()) {
    throw new Error(
      "[auth] GOOGLE_CLIENT_SECRET is not set — refusing to start in production",
    );
  }
}

export const authOptions: NextAuthOptions = {
  // Opt-in only: debug logs include provider secrets.
  debug: process.env.NEXTAUTH_DEBUG === "true",
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      allowDangerousEmailAccountLinking: false,
    }),
  ],
  // JWT avoids DB Session rows (Prisma adapter still creates User + Account on OAuth).
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    signIn: ({ user, account }) => {
      if (account?.provider === "google") {
        if (!user.email) return false;
        // Google vouches for all emails it returns via OAuth —
        // including Workspace/institutional accounts (hd= domains).
        // We only need a present email, not emailVerified on the token.
      }
      return true;
    },
    session: ({ session, token }) => {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
