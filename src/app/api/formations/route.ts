// src/app/api/formations/route.ts — Liste formations publiques
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const querySchema = z.object({
  secteur: z.string().optional(),
  niveau: z.enum(["DEBUTANT","INTERMEDIAIRE","AVANCE"]).optional(),
  prix: z.enum(["gratuit","payant"]).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(12),
});

export async function GET(req: NextRequest) {
  try {
    const params = Object.fromEntries(req.nextUrl.searchParams.entries());
    const { secteur, niveau, prix, page, limit } = querySchema.parse(params);
    const where: any = { statut: "PUBLIEE" };
    if (secteur) where.secteur = { contains: secteur, mode: "insensitive" };
    if (niveau) where.niveau = niveau;
    if (prix === "gratuit") where.prix = null;
    if (prix === "payant") where.prix = { gt: 0 };

    const [formations, total] = await Promise.all([
      prisma.formationCourse.findMany({
        where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: "desc" },
        include: { _count: { select: { inscriptions: true, avis: true } } },
      }),
      prisma.formationCourse.count({ where }),
    ]);

    return NextResponse.json({ data: formations, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: (err as any).issues?.[0]?.message ?? "Données invalides" }, { status: 422 });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
