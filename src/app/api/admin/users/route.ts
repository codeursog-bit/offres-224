// src/app/api/admin/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/logger";
import bcrypt from "bcryptjs";
import { z } from "zod";

function requireAdmin(session: any) {
  if (!session || session.user.role !== "SUPER_ADMIN") return false;
  return true;
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!requireAdmin(session)) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const role = req.nextUrl.searchParams.get("role");
  const isBanned = req.nextUrl.searchParams.get("isBanned");
  const search = req.nextUrl.searchParams.get("search");
  const page = parseInt(req.nextUrl.searchParams.get("page") ?? "1");
  const limit = 25;

  const where: any = {};
  if (role) where.role = role;
  if (isBanned === "true") where.isBanned = true;
  if (search) {
    where.OR = [
      { email: { contains: search, mode: "insensitive" } },
      { profilCandidat: { OR: [{ prenom: { contains: search, mode: "insensitive" } }, { nom: { contains: search, mode: "insensitive" } }] } },
      { profilEntreprise: { nomEntreprise: { contains: search, mode: "insensitive" } } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true, email: true, role: true, isActive: true, isBanned: true,
        banReason: true, banExpireAt: true, lastLoginAt: true, createdAt: true,
        profilCandidat: { select: { prenom: true, nom: true, ville: true, photoUrl: true } },
        profilEntreprise: { select: { nomEntreprise: true, ville: true, isVerifiee: true, logoUrl: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({ data: users, total, page, pages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!requireAdmin(session)) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const schema = z.object({
      email: z.string().email(),
      prenom: z.string().min(1),
      nom: z.string().min(1),
      mdpTemp: z.string().min(8),
    });
    const body = schema.parse(await req.json());

    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing) return NextResponse.json({ error: "Email déjà utilisé" }, { status: 409 });

    const passwordHash = await bcrypt.hash(body.mdpTemp, 12);
    const user = await prisma.user.create({
      data: { email: body.email, passwordHash, role: "SUPER_ADMIN" },
    });

    await logAction({ action: "ADMIN_CREE", userId: session!.user.id, cible: user.id, details: { email: body.email } });
    return NextResponse.json({ success: true, data: { id: user.id } }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: (err as any).issues?.[0]?.message ?? "Données invalides" }, { status: 422 });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
