// src/app/api/applications/route.ts — Postuler à une offre
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/logger";
import { notifierUser, notifierAdmins } from "@/lib/notifications";
import { calculerScore } from "@/lib/utils";
import { z } from "zod";

const schema = z.object({
  offreId: z.string().cuid(),
  lettreMotivation: z.string().min(100, "Minimum 100 caractères").max(2000).optional(),
  pretentionSalariale: z.number().positive().optional(),
  source: z.string().max(100).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    if (session.user.role !== "CANDIDAT") {
      return NextResponse.json({ error: "Réservé aux candidats" }, { status: 403 });
    }

    const body = schema.parse(await req.json());

    // Vérifier l'offre
    const offre = await prisma.offre.findUnique({
      where: { id: body.offreId, statut: "PUBLIEE" },
      include: {
        entreprise: {
          include: {
            user: { select: { id: true } },
          },
        },
      },
    });
    if (!offre) return NextResponse.json({ error: "Offre introuvable ou fermée" }, { status: 404 });
    if (offre.dateLimite && offre.dateLimite < new Date()) {
      return NextResponse.json({ error: "Date limite dépassée" }, { status: 400 });
    }

    // Vérifier doublon
    const existing = await prisma.candidature.findUnique({
      where: { offreId_candidatId: { offreId: body.offreId, candidatId: session.user.id } },
    });
    if (existing) return NextResponse.json({ error: "Vous avez déjà postulé à cette offre" }, { status: 409 });

    // Récupérer profil
    const profil = await prisma.profilCandidat.findUnique({
      where: { userId: session.user.id },
      include: { competences: { include: { competence: true } } },
    });
    if (!profil) return NextResponse.json({ error: "Profil candidat introuvable" }, { status: 404 });

    // Calcul score
    const offreCompetences = await prisma.offreCompetence.findMany({
      where: { offreId: body.offreId },
      include: { competence: true },
    });
    const score = calculerScore(
      profil.competences.map((c: any) => c.competence.nom),
      offreCompetences.map((c: any) => c.competence.nom)
    );

    // Créer candidature
    const candidature = await prisma.$transaction(async (tx: any) => {
      const c = await tx.candidature.create({
        data: {
          offreId: body.offreId,
          candidatId: session.user.id,
          profilCandidatId: profil.id,
          lettreMotivation: body.lettreMotivation,
          pretentionSalariale: body.pretentionSalariale,
          source: body.source,
          cvUrlSnapshot: profil.cvFileUrl,
          scoreCompatibilite: score,
        },
      });
      await tx.candidatureStatutHistorique.create({
        data: { candidatureId: c.id, statut: "ENVOYEE", changedBy: session.user.id },
      });
      return c;
    });

    // Notifier le RH
    await notifierUser(offre.entreprise.user.id, {
      type: "NOUVELLE_CANDIDATURE",
      titre: "Nouvelle candidature reçue",
      contenu: `Un candidat a postulé à l'offre : ${offre.titre}`,
      lien: `/dashboard/rh/candidatures`,
    });

    await logAction({
      action: "CANDIDATURE_ENVOYEE",
      userId: session.user.id,
      cible: body.offreId,
      details: { score, offreTitre: offre.titre },
    });

    return NextResponse.json({ success: true, data: { id: candidature.id, scoreCompatibilite: score } }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: (err as any).issues?.[0]?.message ?? "Données invalides" }, { status: 422 });
    }
    console.error("[APPLICATIONS POST]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const page = parseInt(req.nextUrl.searchParams.get("page") ?? "1");
  const statut = req.nextUrl.searchParams.get("statut");
  const limit = 20;

  const where: any = { candidatId: session.user.id };
  if (statut) where.statut = statut;

  const [candidatures, total] = await Promise.all([
    prisma.candidature.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        offre: {
          select: {
            titre: true, ville: true, contratType: true,
            entreprise: { select: { nomEntreprise: true, logoUrl: true } },
          },
        },
        historique: { orderBy: { createdAt: "asc" } },
      },
    }),
    prisma.candidature.count({ where }),
  ]);

  return NextResponse.json({ data: candidatures, total, page, pages: Math.ceil(total / limit) });
}
