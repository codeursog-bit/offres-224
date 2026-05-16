// src/app/api/candidat/profil/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import { prisma } from "@/lib/prisma";
import { calculerProfilComplete } from "@/lib/utils";
import { z } from "zod";

const competenceSchema = z.object({ nom: z.string().min(1).max(100), niveau: z.string().optional() });
const langueSchema = z.object({ langue: z.string().min(1).max(50), niveau: z.enum(["NOTIONS","INTERMEDIAIRE","COURANT","BILINGUE","LANGUE_MATERNELLE"]) });
const experienceSchema = z.object({
  poste: z.string().min(1).max(200), entreprise: z.string().min(1).max(200),
  ville: z.string().optional(), dateDebut: z.string(), dateFin: z.string().optional(),
  description: z.string().max(1000).optional(), ordre: z.number().default(0),
});
const formationSchema = z.object({
  diplome: z.string().min(1).max(200), ecole: z.string().min(1).max(200),
  ville: z.string().optional(), annee: z.number().optional(), mention: z.string().optional(), ordre: z.number().default(0),
});
const patchSchema = z.object({
  prenom: z.string().min(1).max(50).optional(),
  nom: z.string().min(1).max(50).optional(),
  titreProfessionnel: z.string().max(200).optional(),
  photoUrl: z.string().url().optional().nullable(),
  ville: z.string().max(100).optional(),
  telephone: z.string().max(20).optional(),
  linkedin: z.string().url().optional().nullable(),
  bio: z.string().max(1000).optional(),
  cvFileUrl: z.string().url().optional().nullable(),
  niveauFormation: z.enum(["SANS_DIPLOME","BEPC","BAC","BTS_DUT","LICENCE","MASTER","DOCTORAT","FORMATION_PRO"]).optional(),
  niveauExperience: z.enum(["SANS_EXPERIENCE","JUNIOR","INTERMEDIAIRE","SENIOR","EXPERT"]).optional(),
  salaireSouhaite: z.number().positive().optional(),
  disponibilite: z.string().optional(),
  isPublic: z.boolean().optional(),
  secteurPrincipal: z.string().optional(),
  experiences: z.array(experienceSchema).optional(),
  formations: z.array(formationSchema).optional(),
  competences: z.array(competenceSchema).optional(),
  langues: z.array(langueSchema).optional(),
});

export async function GET(_req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const profil = await prisma.profilCandidat.findUnique({
    where: { userId: session.user.id },
    include: {
      experiences: { orderBy: { ordre: "asc" } },
      formations: { orderBy: { ordre: "asc" } },
      competences: { include: { competence: true } },
      langues: true,
    },
  });

  if (!profil) return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });
  return NextResponse.json({ data: profil });
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const body = patchSchema.parse(await req.json());
    const { experiences, formations, competences, langues, ...scalarFields } = body;

    const updated = await prisma.$transaction(async (tx: any) => {
      // Champs scalaires
      const profil = await tx.profilCandidat.update({
        where: { userId: session.user.id },
        data: scalarFields,
      });

      // Expériences — recréer toute la liste
      if (experiences !== undefined) {
        await tx.experience.deleteMany({ where: { profilId: profil.id } });
        if (experiences.length > 0) {
          await tx.experience.createMany({
            data: experiences.map((e) => ({
              profilId: profil.id,
              poste: e.poste, entreprise: e.entreprise, ville: e.ville,
              dateDebut: new Date(e.dateDebut),
              dateFin: e.dateFin ? new Date(e.dateFin) : null,
              description: e.description, ordre: e.ordre,
            })),
          });
        }
      }

      // Formations
      if (formations !== undefined) {
        await tx.formationCandidat.deleteMany({ where: { profilId: profil.id } });
        if (formations.length > 0) {
          await tx.formationCandidat.createMany({
            data: formations.map((f) => ({ profilId: profil.id, ...f })),
          });
        }
      }

      // Compétences — upsert Competence puis ProfilCompetence
      if (competences !== undefined) {
        await tx.profilCompetence.deleteMany({ where: { profilId: profil.id } });
        for (const c of competences) {
          const comp = await tx.competence.upsert({
            where: { nom: c.nom },
            create: { nom: c.nom },
            update: {},
          });
          await tx.profilCompetence.create({
            data: { profilId: profil.id, competenceId: comp.id, niveau: c.niveau },
          });
        }
      }

      // Langues
      if (langues !== undefined) {
        await tx.profilLangue.deleteMany({ where: { profilId: profil.id } });
        if (langues.length > 0) {
          await tx.profilLangue.createMany({
            data: langues.map((l) => ({ profilId: profil.id, langue: l.langue, niveau: l.niveau })),
          });
        }
      }

      // Recalculer profilComplete
      const fresh = await tx.profilCandidat.findUnique({
        where: { id: profil.id },
        include: { experiences: true, formations: true, competences: true, langues: true },
      });
      const score = calculerProfilComplete({
        photoUrl: fresh?.photoUrl, bio: fresh?.bio, ville: fresh?.ville,
        titreProfessionnel: fresh?.titreProfessionnel, telephone: fresh?.telephone,
        cvFileUrl: fresh?.cvFileUrl, experiences: fresh?.experiences,
        formations: fresh?.formations, competences: fresh?.competences, langues: fresh?.langues,
      });

      return tx.profilCandidat.update({ where: { id: profil.id }, data: { profilComplete: score } });
    });

    return NextResponse.json({ data: updated });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: (err as any).issues?.[0]?.message ?? "Données invalides" }, { status: 422 });
    console.error("[PROFIL PATCH]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
