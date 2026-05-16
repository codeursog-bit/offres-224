// src/app/api/offres/[id]/route.ts — Détail offre
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const offre = await prisma.offre.findUnique({
      where: { id: params.id, statut: "PUBLIEE" },
      include: {
        entreprise: {
          select: {
            id: true, nomEntreprise: true, logoUrl: true, isVerifiee: true,
            ville: true, secteur: true, tailleEntreprise: true, siteWeb: true,
            description: true, noteGlobale: true, nbAvis: true,
          },
        },
        competencesRequises: { include: { competence: { select: { nom: true } } } },
        languesRequises: true,
        _count: { select: { candidatures: true } },
      },
    });

    if (!offre) return NextResponse.json({ error: "Offre introuvable" }, { status: 404 });

    // Incrémenter vues (fire and forget)
    prisma.offre.update({ where: { id: params.id }, data: { vues: { increment: 1 } } }).catch(() => {});

    return NextResponse.json({ data: offre });
  } catch (err) {
    console.error("[OFFRE DETAIL]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
