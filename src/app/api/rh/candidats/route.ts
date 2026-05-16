// src/app/api/rh/candidats/route.ts — CVthèque
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import { prisma } from "@/lib/prisma";
import { calculerScore } from "@/lib/utils";
import { z } from "zod";

const querySchema = z.object({
  q: z.string().optional(),
  ville: z.string().optional(),
  secteur: z.string().optional(),
  experience: z.string().optional(),
  formation: z.string().optional(),
  competences: z.string().optional(), // comma-separated
  offreId: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  sort: z.enum(["recent","experience","score"]).default("recent"),
  limit: z.coerce.number().min(1).max(50).default(20),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "RH" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const params = Object.fromEntries(req.nextUrl.searchParams.entries());
    const { q, ville, secteur, experience, formation, competences, offreId, page, sort, limit } = querySchema.parse(params);

    const where: any = { isPublic: true };
    if (ville) where.ville = { contains: ville, mode: "insensitive" };
    if (secteur) where.secteurPrincipal = { contains: secteur, mode: "insensitive" };
    if (experience) where.niveauExperience = experience;
    if (formation) where.niveauFormation = formation;
    if (q) {
      where.OR = [
        { titreProfessionnel: { contains: q, mode: "insensitive" } },
        { bio: { contains: q, mode: "insensitive" } },
        { prenom: { contains: q, mode: "insensitive" } },
        { nom: { contains: q, mode: "insensitive" } },
      ];
    }

    // Filtre par compétences
    if (competences) {
      const comps = competences.split(",").map((c: any) => c.trim()).filter(Boolean);
      if (comps.length > 0) {
        where.competences = {
          some: { competence: { nom: { in: comps, mode: "insensitive" } } },
        };
      }
    }

    const orderBy: any =
      sort === "experience"
        ? { niveauExperience: "desc" }
        : sort === "score"
        ? { profilComplete: "desc" }
        : { updatedAt: "desc" };

    const [candidats, total] = await Promise.all([
      prisma.profilCandidat.findMany({
        where, skip: (page - 1) * limit, take: limit, orderBy,
        select: {
          id: true, prenom: true, nom: true, titreProfessionnel: true,
          photoUrl: true, ville: true, niveauExperience: true,
          niveauFormation: true, secteurPrincipal: true, profilComplete: true,
          disponibilite: true, updatedAt: true,
          competences: { include: { competence: { select: { nom: true } } }, take: 5 },
          langues: { select: { langue: true, niveau: true } },
        },
      }),
      prisma.profilCandidat.count({ where }),
    ]);

    // Calculer score si offreId fourni
    let result = candidats as any[];
    if (offreId) {
      const offreComps = await prisma.offreCompetence.findMany({
        where: { offreId }, include: { competence: { select: { nom: true } } },
      });
      const offreNoms = offreComps.map((c: any) => c.competence.nom);
      result = candidats.map((c: any) => ({
        ...c,
        scoreCompatibilite: calculerScore(c.competences.map((pc: any) => pc.competence.nom), offreNoms),
      }));
      if (sort === "score") result.sort((a, b) => b.scoreCompatibilite - a.scoreCompatibilite);
    }

    return NextResponse.json({ data: result, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: (err as any).issues?.[0]?.message ?? "Données invalides" }, { status: 422 });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
