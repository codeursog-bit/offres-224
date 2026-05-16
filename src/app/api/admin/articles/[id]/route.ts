// src/app/api/admin/articles/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/logger";
import { z } from "zod";

const patchSchema = z.object({
  titre: z.string().min(5).max(300).optional(),
  extrait: z.string().max(300).optional(),
  contenu: z.string().min(50).optional(),
  categorie: z.enum(["cv","entretien","reconversion","droits","secteurs"]).optional(),
  imageUrl: z.string().url().optional().nullable(),
  auteur: z.string().optional(),
  isFeatured: z.boolean().optional(),
  isPublie: z.boolean().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "SUPER_ADMIN") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const body = patchSchema.parse(await req.json());
    const current = await prisma.article.findUnique({ where: { id: params.id } });
    if (!current) return NextResponse.json({ error: "Article introuvable" }, { status: 404 });

    // Recalculer temps de lecture si contenu changé
    let tpsLecture = current.tpsLecture;
    if (body.contenu) {
      tpsLecture = Math.max(1, Math.round(body.contenu.split(/\s+/).length / 200));
    }

    const updated = await prisma.article.update({
      where: { id: params.id },
      data: {
        ...body,
        tpsLecture,
        // Si on publie pour la première fois → set publieAt
        publieAt: body.isPublie && !current.isPublie ? new Date() : current.publieAt,
        // Si on dépublie → garder publieAt
      },
    });

    await logAction({ action: "ARTICLE_MODIFIE", userId: session.user.id, cible: params.id });
    return NextResponse.json({ data: updated });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: (err as any).issues?.[0]?.message ?? "Données invalides" }, { status: 422 });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session || session.user.role !== "SUPER_ADMIN") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  await prisma.article.delete({ where: { id: params.id } });
  await logAction({ action: "ARTICLE_SUPPRIME", userId: session.user.id, cible: params.id });
  return NextResponse.json({ success: true });
}
