import "next-auth";
declare module "next-auth" {
  interface User { id: string; role?: string; prenom?: string; nom?: string; }
  interface Session {
    user: { id: string; email: string; role: string; prenom?: string; nom?: string; };
  }
}
declare module "next-auth/jwt" {
  interface JWT { id?: string; role?: string; prenom?: string; nom?: string; }
}
