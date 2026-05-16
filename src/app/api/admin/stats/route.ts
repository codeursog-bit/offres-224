// src/app/api/admin/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "SUPER_ADMIN") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const period = parseInt(req.nextUrl.searchParams.get("period") ?? "30");
  const since = new Date(Date.now() - period * 86400000);

  const [
    offresEnAttente,
    signalements,
    nouveauxUsers,
    rhNonVerifies,
    totalCandidats,
    totalRH,
    inscriptionsParJour,
    offresParStatut,
    adsActives,
    adsStats,
  ] = await Promise.all([
    prisma.offre.count({ where: { statut: "EN_ATTENTE" } }),
    prisma.signalement.count({ where: { statut: { in: ["OUVERT","EN_COURS"] } } }),
    prisma.user.count({ where: { createdAt: { gte: new Date(Date.now() - 86400000) } } }),
    prisma.profilEntreprise.count({ where: { isVerifiee: false } }),
    prisma.user.count({ where: { role: "CANDIDAT" } }),
    prisma.user.count({ where: { role: "RH" } }),
    // Inscriptions par jour (30 derniers jours)
    Promise.all(
      Array.from({ length: Math.min(period, 30) }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const start = new Date(date.setHours(0, 0, 0, 0));
        const end = new Date(date.setHours(23, 59, 59, 999));
        return prisma.user.count({ where: { createdAt: { gte: start, lte: end } } })
          .then((count: number) => ({ date: start.toISOString().split("T")[0], count }));
      })
    ).then((r) => r.reverse()),
    prisma.offre.groupBy({ by: ["statut"], _count: { id: true } }),
    prisma.ad.count({ where: { statut: "ACTIF", isActive: true } }),
    prisma.ad.aggregate({ _sum: { impressionsCount: true, clicksCount: true } }),
  ]);

  return NextResponse.json({
    data: {
      kpis: { offresEnAttente, signalements, nouveauxUsers, rhNonVerifies },
      users: { totalCandidats, totalRH },
      inscriptionsParJour,
      offresParStatut: offresParStatut.map((o: any) => ({ statut: o.statut, count: o._count.id })),
      ads: {
        actives: adsActives,
        totalImpressions: adsStats._sum.impressionsCount ?? 0,
        totalClics: adsStats._sum.clicksCount ?? 0,
      },
    },
  });
}
