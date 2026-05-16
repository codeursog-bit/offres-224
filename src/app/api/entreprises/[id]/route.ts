// src/app/api/entreprises/[id]/route.ts — Profil entreprise public
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const entreprise = await prisma.profilEntreprise.findUnique({
    where: { id: params.id, isSuspendue: false },
    include: {
      offres: {
        where: { statut: "PUBLIEE" },
        orderBy: { publishedAt: "desc" },
        take: 10,
        select: { id: true, titre: true, ville: true, contratType: true, publishedAt: true, isPremium: true },
      },
      avisRecus: {
        where: { isVerifie: true },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { note: true, titre: true, commentaire: true, isAnonyme: true, createdAt: true },
      },
      _count: { select: { offres: true, avisRecus: true } },
    },
  });

  if (!entreprise) return NextResponse.json({ error: "Entreprise introuvable" }, { status: 404 });
  return NextResponse.json({ data: entreprise });
}
