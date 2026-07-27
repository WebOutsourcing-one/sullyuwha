import NextAuth from "next-auth";
import type { DefaultSession } from "next-auth";
import Kakao from "next-auth/providers/kakao";
import Naver from "next-auth/providers/naver";
import Credentials from "next-auth/providers/credentials";

declare module "next-auth" {
  interface User {
    role?: string;
  }
  interface Session {
    user: {
      role?: string;
    } & DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role?: string;
  }
}

async function ensureAdminUser() {
  const adminEmail = process.env.AUTH_ADMIN_EMAIL;
  if (!adminEmail) return;

  const { getPrisma } = await import("@/infrastructure/db/prisma");
  const prisma = getPrisma();

  const existing = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existing) {
    await prisma.user.create({
      data: { email: adminEmail, name: "Admin", role: "admin" },
    });
  } else if (existing.role !== "admin") {
    await prisma.user.update({
      where: { id: existing.id },
      data: { role: "admin" },
    });
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Admin",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const adminEmail = process.env.AUTH_ADMIN_EMAIL;
        const adminPassword = process.env.AUTH_ADMIN_PASSWORD;
        if (!adminEmail || !adminPassword) return null;
        if (credentials?.email !== adminEmail || credentials?.password !== adminPassword) return null;

        await ensureAdminUser();

        return { id: "admin", email: adminEmail, name: "Admin", role: "admin" };
      },
    }),
    Kakao,
    Naver,
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = user.role;
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.role = token.role;
      return session;
    },
  },
  pages: { signIn: "/sull-admin/login" },
});
