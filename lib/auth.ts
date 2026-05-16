import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        });

        // Correction du problème bcrypt : on s'assure que passwordHash est une string
        if (!user || !user.passwordHash) return null;
        if (!user.isActive || user.isBanned) throw new Error("Compte désactivé");

        const isValid = await bcrypt.compare(
          credentials.password as string, 
          user.passwordHash
        );
        
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          role: user.role,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        (session.user as any).role = token.role;
      }
      return session;
    }
  },
  pages: {
    signIn: "/connexion",
  },
  session: { strategy: "jwt" }
});