// src/app/api/admin/articles/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/logger";
import { genererSlug } from "@/lib/utils";
import { z } from "zod";

const createSchema = z.object({
  titre: z.string().min(5).max(300),
  slug: z.string().optional(),
  extrait: z.string().max(300).optional(),
  contenu: z.string().min(50),
  categorie: z.enum(["cv","entretien","reconversion","droits","secteurs"]),
  imageUrl: z.string().url().optional(),
  auteur: z.string().min(2).max(100),
  tpsLecture: z.number().positive().optional(),
  isFeatured: z.boolean().default(false),
  isPublie: z.boolean().default(false),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "SUPER_ADMIN") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const page = parseInt(req.nextUrl.searchParams.get("page") ?? "1");
  const statut = req.nextUrl.searchParams.get("statut"); // "publie" | "brouillon"
  const limit = 20;
  const where: any = {};
  if (statut === "publie") where.isPublie = true;
  if (statut === "brouillon") where.isPublie = false;

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where, skip: (page - 1) * limit, take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.article.count({ where }),
  ]);

  return NextResponse.json({ data: articles, total, page, pages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "SUPER_ADMIN") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const body = createSchema.parse(await req.json());

    // Calculer temps de lecture si non fourni
    const wordCount = body.contenu.split(/\s+/).length;
    const tpsLecture = body.tpsLecture ?? Math.max(1, Math.round(wordCount / 200));

    // Générer slug unique
    let slug = body.slug ?? genererSlug(body.titre);
    const existing = await prisma.article.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now()}`;

    const article = await prisma.article.create({
      data: {
        ...body,
        slug,
        tpsLecture,
        publieAt: body.isPublie ? new Date() : null,
      },
    });

    await logAction({ action: "ARTICLE_CREE", userId: session.user.id, cible: article.id });
    return NextResponse.json({ success: true, data: { id: article.id, slug: article.slug } }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: (err as any).issues?.[0]?.message ?? "Données invalides" }, { status: 422 });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
