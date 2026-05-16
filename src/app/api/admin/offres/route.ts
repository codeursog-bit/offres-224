// src/app/api/admin/offres/route.ts — Toutes les offres (admin)
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/logger";
import { z } from "zod";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "SUPER_ADMIN") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const statut = req.nextUrl.searchParams.get("statut");
  const search = req.nextUrl.searchParams.get("search");
  const ville = req.nextUrl.searchParams.get("ville");
  const secteur = req.nextUrl.searchParams.get("secteur");
  const page = parseInt(req.nextUrl.searchParams.get("page") ?? "1");
  const limit = 25;

  const where: any = {};
  if (statut) where.statut = statut;
  if (ville) where.ville = { contains: ville, mode: "insensitive" };
  if (secteur) where.secteur = { contains: secteur, mode: "insensitive" };
  if (search) where.OR = [
    { titre: { contains: search, mode: "insensitive" } },
    { entreprise: { nomEntreprise: { contains: search, mode: "insensitive" } } },
  ];

  const [offres, total] = await Promise.all([
    prisma.offre.findMany({
      where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: "desc" },
      include: {
        entreprise: { select: { nomEntreprise: true, isVerifiee: true, logoUrl: true } },
        _count: { select: { candidatures: true } },
      },
    }),
    prisma.offre.count({ where }),
  ]);

  return NextResponse.json({ data: offres, total, page, pages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "SUPER_ADMIN") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const schema = z.object({
      entrepriseId: z.string().cuid(),
      titre: z.string().min(5).max(200),
      description: z.string().min(50),
      ville: z.string().min(2),
      contratType: z.enum(["CDI","CDD","STAGE","INTERIM","FREELANCE","TEMPS_PARTIEL"]),
      secteur: z.string().optional(),
      salaireMin: z.number().optional(),
      salaireMax: z.number().optional(),
      dateLimite: z.string().optional(),
    });
    const body = schema.parse(await req.json());

    const offre = await prisma.offre.create({
      data: {
        ...body,
        dateLimite: body.dateLimite ? new Date(body.dateLimite) : null,
        statut: "PUBLIEE",
        publishedAt: new Date(),
        valideePar: session.user.id,
        valideeAt: new Date(),
      },
    });

    await logAction({ action: "OFFRE_CREEE_ADMIN", userId: session.user.id, cible: offre.id });
    return NextResponse.json({ success: true, data: { id: offre.id } }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: (err as any).issues?.[0]?.message ?? "Données invalides" }, { status: 422 });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
