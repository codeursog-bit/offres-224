// src/app/api/admin/entreprises/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/logger";
import bcrypt from "bcryptjs";
import { z } from "zod";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "SUPER_ADMIN") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const page = parseInt(req.nextUrl.searchParams.get("page") ?? "1");
  const search = req.nextUrl.searchParams.get("search");
  const isVerifiee = req.nextUrl.searchParams.get("isVerifiee");
  const isSuspendue = req.nextUrl.searchParams.get("isSuspendue");
  const limit = 25;
  const where: any = {};
  if (search) where.OR = [{ nomEntreprise: { contains: search, mode: "insensitive" } }, { numeroRCCM: { contains: search } }];
  if (isVerifiee === "true") where.isVerifiee = true;
  if (isVerifiee === "false") where.isVerifiee = false;
  if (isSuspendue === "true") where.isSuspendue = true;

  const [entreprises, total] = await Promise.all([
    prisma.profilEntreprise.findMany({
      where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: "desc" },
      include: { _count: { select: { offres: true } }, user: { select: { id: true, isActive: true, isBanned: true, createdAt: true } } },
    }),
    prisma.profilEntreprise.count({ where }),
  ]);

  return NextResponse.json({ data: entreprises, total, page, pages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "SUPER_ADMIN") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const schema = z.object({
      email: z.string().email(), nomEntreprise: z.string().min(2), secteur: z.string().optional(),
      numeroRCCM: z.string().optional(), nomResponsable: z.string().optional(),
      telephone: z.string().optional(), ville: z.string().optional(), mdpTemp: z.string().min(8),
      isVerifiee: z.boolean().default(false),
    });
    const body = schema.parse(await req.json());

    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing) return NextResponse.json({ error: "Email déjà utilisé" }, { status: 409 });

    const passwordHash = await bcrypt.hash(body.mdpTemp, 12);
    const user = await prisma.$transaction(async (tx: any) => {
      const u = await tx.user.create({ data: { email: body.email, passwordHash, role: "RH" } });
      await tx.profilEntreprise.create({
        data: {
          userId: u.id, nomEntreprise: body.nomEntreprise, secteur: body.secteur,
          numeroRCCM: body.numeroRCCM, ville: body.ville,
          isVerifiee: body.isVerifiee, verifieeBy: body.isVerifiee ? session.user.id : null,
          verifieeAt: body.isVerifiee ? new Date() : null,
        },
      });
      return u;
    });

    await logAction({ action: "ENTREPRISE_CREEE_ADMIN", userId: session.user.id, cible: user.id });
    return NextResponse.json({ success: true, data: { id: user.id } }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: (err as any).issues?.[0]?.message ?? "Données invalides" }, { status: 422 });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
