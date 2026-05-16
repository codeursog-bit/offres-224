// src/app/api/articles/[slug]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const article = await prisma.article.findUnique({
    where: { slug: params.slug, isPublie: true },
  });
  if (!article) return NextResponse.json({ error: "Article introuvable" }, { status: 404 });

  // Incrémenter vues
  prisma.article.update({ where: { id: article.id }, data: { vues: { increment: 1 } } }).catch(() => {});
  return NextResponse.json({ data: article });
}
