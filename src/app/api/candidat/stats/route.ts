// src/app/api/candidat/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "CANDIDAT") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalCandidatures,
    candidaturesCeMois,
    offresSauvegardees,
    profil,
    candidaturesRecentes,
    nbMessages,
  ] = await Promise.all([
    prisma.candidature.count({ where: { candidatId: session.user.id } }),
    prisma.candidature.count({ where: { candidatId: session.user.id, createdAt: { gte: startOfMonth } } }),
    prisma.offreSauvegardee.count({ where: { userId: session.user.id } }),
    prisma.profilCandidat.findUnique({
      where: { userId: session.user.id },
      select: { profilComplete: true, vuesCeMois: true },
    }),
    prisma.candidature.findMany({
      where: { candidatId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        offre: {
          select: {
            titre: true,
            entreprise: { select: { nomEntreprise: true, logoUrl: true } },
          },
        },
      },
    }),
    prisma.message.count({
      where: {
        conversation: { membres: { some: { userId: session.user.id } } },
        expediteurId: { not: session.user.id },
        statut: { not: "LU" },
      },
    }),
  ]);

  return NextResponse.json({
    data: {
      totalCandidatures,
      candidaturesCeMois,
      offresSauvegardees,
      profilComplete: profil?.profilComplete ?? 0,
      vuesCeMois: profil?.vuesCeMois ?? 0,
      candidaturesRecentes,
      nbMessagesNonLus: nbMessages,
    },
  });
}
