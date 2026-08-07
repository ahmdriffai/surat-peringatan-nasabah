import type { Role } from "@/generated/prisma/client";
import { checkLogin } from "@/services/auth/login";
import type { DefaultSession, NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      nama: string;
      role: Role;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    nama: string;
    role: Role;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    nama: string;
    role: Role;
  }
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const user = await checkLogin(credentials.email, credentials.password);
          return user;
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.nama = user.nama;
        token.role = user.role;
      }
      if (trigger === "update" && session?.nama) {
        token.nama = session.nama;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id;
      session.user.nama = token.nama;
      session.user.role = token.role;
      return session;
    },
  },
};
