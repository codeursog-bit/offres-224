// src/app/api/entreprises/route.ts — Annuaire public
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const querySchema = z.object({
  secteur: z.string().optional(),
  ville: z.string().optional(),
  verified: z.enum(["true","false"]).optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(12),
});

export async function GET(req: NextRequest) {
  try {
    const params = Object.fromEntries(req.nextUrl.searchParams.entries());
    const { secteur, ville, verified, search, page, limit } = querySchema.parse(params);

    const where: any = { isSuspendue: false };
    if (secteur) where.secteur = { contains: secteur, mode: "insensitive" };
    if (ville) where.ville = { contains: ville, mode: "insensitive" };
    if (verified === "true") where.isVerifiee = true;
    if (search) where.nomEntreprise = { contains: search, mode: "insensitive" };

    const [entreprises, total] = await Promise.all([
      prisma.profilEntreprise.findMany({
        where, skip: (page - 1) * limit, take: limit,
        orderBy: [{ isVerifiee: "desc" }, { createdAt: "desc" }],
        select: {
          id: true, nomEntreprise: true, secteur: true, ville: true,
          logoUrl: true, isVerifiee: true, noteGlobale: true, nbAvis: true,
          description: true, tailleEntreprise: true,
          _count: { select: { offres: true } },
        },
      }),
      prisma.profilEntreprise.count({ where }),
    ]);

    return NextResponse.json({ data: entreprises, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: (err as any).issues?.[0]?.message ?? "Données invalides" }, { status: 422 });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
