// src/app/api/rh/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "RH") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const entreprise = await prisma.profilEntreprise.findUnique({ where: { userId: session.user.id } });
  if (!entreprise) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  const period = req.nextUrl.searchParams.get("period") ?? "30";
  const days = parseInt(period);
  const since = new Date(Date.now() - days * 86400000);

  const [
    offresActives,
    candidaturesCeMois,
    candidaturesNonTraitees,
    nbMessagesNonLus,
    offresExpirantBientot,
    candidaturesParSemaine,
  ] = await Promise.all([
    prisma.offre.count({ where: { entrepriseId: entreprise.id, statut: "PUBLIEE" } }),
    prisma.candidature.count({
      where: { offre: { entrepriseId: entreprise.id }, createdAt: { gte: since } },
    }),
    prisma.candidature.count({
      where: { offre: { entrepriseId: entreprise.id }, isVuParRH: false, statut: "ENVOYEE" },
    }),
    prisma.message.count({
      where: {
        conversation: { membres: { some: { userId: session.user.id } } },
        expediteurId: { not: session.user.id },
        statut: { not: "LU" },
      },
    }),
    prisma.offre.findMany({
      where: {
        entrepriseId: entreprise.id,
        statut: "PUBLIEE",
        dateLimite: { gte: new Date(), lte: new Date(Date.now() + 7 * 86400000) },
      },
      select: { id: true, titre: true, dateLimite: true },
    }),
    // Candidatures par semaine (8 dernières semaines)
    Promise.all(
      Array.from({ length: 8 }, (_, i) => {
        const start = new Date(Date.now() - (i + 1) * 7 * 86400000);
        const end = new Date(Date.now() - i * 7 * 86400000);
        return prisma.candidature.count({
          where: { offre: { entrepriseId: entreprise.id }, createdAt: { gte: start, lt: end } },
        }).then((count: number) => ({ semaine: i + 1, count }));
      })
    ),
  ]);

  return NextResponse.json({
    data: {
      offresActives,
      candidaturesCeMois,
      candidaturesNonTraitees,
      nbMessagesNonLus,
      offresExpirantBientot,
      candidaturesParSemaine: candidaturesParSemaine.reverse(),
    },
  });
}
