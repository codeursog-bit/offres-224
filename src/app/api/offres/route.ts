// src/app/api/offres/route.ts — Liste offres publiques
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const querySchema = z.object({
  q: z.string().optional(),
  ville: z.string().optional(),
  secteur: z.string().optional(),
  contrat: z.string().optional().optional(),
  experience: z.string().optional().optional(),
  salaireMin: z.coerce.number().optional(),
  premium: z.enum(["true", "false"]).optional(),
  page: z.coerce.number().min(1).default(1),
  sort: z.enum(["recent", "salaire", "pertinence"]).default("recent"),
  limit: z.coerce.number().min(1).max(50).default(20),
});

export async function GET(req: NextRequest) {
  try {
    const params = Object.fromEntries(req.nextUrl.searchParams.entries());
    const { q, ville, secteur, contrat, experience, salaireMin, premium, page, sort, limit } =
      querySchema.parse(params);

    const skip = (page - 1) * limit;
    const now = new Date();

    const where: any = {
      statut: "PUBLIEE",
      OR: [{ dateLimite: null }, { dateLimite: { gte: now } }],
    };

    if (q) {
      where.AND = [
        {
          OR: [
            { titre: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
            { secteur: { contains: q, mode: "insensitive" } },
          ],
        },
      ];
    }
    if (ville) where.ville = { contains: ville, mode: "insensitive" };
    if (secteur) where.secteur = { contains: secteur, mode: "insensitive" };
    if (contrat) where.contratType = contrat;
    if (experience) where.niveauExperience = experience;
    if (salaireMin) where.salaireMin = { gte: salaireMin };
    if (premium === "true") where.isPremium = true;

    const orderBy: any =
      sort === "salaire"
        ? { salaireMax: "desc" }
        : sort === "pertinence" && q
        ? { vues: "desc" }
        : { publishedAt: "desc" };

    const [offres, total] = await Promise.all([
      prisma.offre.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          entreprise: {
            select: { nomEntreprise: true, logoUrl: true, isVerifiee: true, ville: true },
          },
          _count: { select: { candidatures: true } },
        },
      }),
      prisma.offre.count({ where }),
    ]);

    // Incrémenter vues en batch (fire and forget)
    if (offres.length > 0) {
      prisma.offre
        .updateMany({ where: { id: { in: offres.map((o: any) => o.id) } }, data: { vues: { increment: 1 } } })
        .catch(() => {});
    }

    return NextResponse.json({
      data: offres,
      total,
      page,
      pages: Math.ceil(total / limit),
      hasNext: page * limit < total,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: (err as any).issues?.[0]?.message ?? "Données invalides" }, { status: 422 });
    }
    console.error("[OFFRES GET]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
