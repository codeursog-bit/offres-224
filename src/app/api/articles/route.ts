// src/app/api/articles/route.ts — Blog conseils (public)
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const querySchema = z.object({
  categorie: z.string().optional(),
  featured: z.enum(["true","false"]).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(9),
});

export async function GET(req: NextRequest) {
  try {
    const params = Object.fromEntries(req.nextUrl.searchParams.entries());
    const { categorie, featured, page, limit } = querySchema.parse(params);
    const where: any = { isPublie: true };
    if (categorie) where.categorie = categorie;
    if (featured === "true") where.isFeatured = true;

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ isFeatured: "desc" }, { publieAt: "desc" }],
        select: {
          id: true, titre: true, slug: true, extrait: true, categorie: true,
          imageUrl: true, auteur: true, tpsLecture: true, vues: true,
          isFeatured: true, publieAt: true,
        },
      }),
      prisma.article.count({ where }),
    ]);

    return NextResponse.json({ data: articles, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: (err as any).issues?.[0]?.message ?? "Données invalides" }, { status: 422 });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
