import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/logger";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = String(credentials.email).toLowerCase().trim();
        const user = await prisma.user.findUnique({
          where: { email },
          include: { profilCandidat: true, profilEntreprise: true },
        });
        if (!user?.passwordHash) return null;
        if (!user.isActive || user.isBanned) return null;
        const valid = await bcrypt.compare(String(credentials.password), user.passwordHash);
        if (!valid) return null;
        await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
        await logAction({ action: "USER_LOGIN", userId: user.id });
        return {
          id: user.id, email: user.email, role: user.role,
          prenom: user.profilCandidat?.prenom ?? "",
          nom: user.profilCandidat?.nom ?? "",
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) { token.id = user.id; token.role = user.role; token.prenom = user.prenom; token.nom = user.nom; }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) { session.user.id = token.id; session.user.role = token.role; session.user.prenom = token.prenom; session.user.nom = token.nom; }
      return session;
    },
  },
  pages: { signIn: "/connexion", error: "/connexion" },
});