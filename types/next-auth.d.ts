// types/next-auth.d.ts
import { type DefaultSession } from "next-auth";
import { Role } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    role: Role;
  }
}

import { type JWT } from "next-auth/jwt";

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
  }
}