// src/app/api/rh/offres/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/logger";
import { notifierAdmins } from "@/lib/notifications";
import { z } from "zod";

const emptyToUndefined = z.string().optional().transform(v => v === "" ? undefined : v);

const createSchema = z.object({
  titre: z.string().min(5).max(200),
  description: z.string().min(50).max(10000),
  profilRecherche: emptyToUndefined,
  avantages: emptyToUndefined,
  secteur: emptyToUndefined,
  ville: z.string().min(2).max(100),
  adresse: emptyToUndefined,
  contratType: z.enum(["CDI","CDD","STAGE","INTERIM","FREELANCE","TEMPS_PARTIEL"]),
  nbrePostes: z.coerce.number().min(1).max(999).default(1),
  niveauExperience: z.enum(["SANS_EXPERIENCE","JUNIOR","INTERMEDIAIRE","SENIOR","EXPERT"]).optional().or(z.literal("").transform(() => undefined)),
  niveauFormation: z.enum(["SANS_DIPLOME","BEPC","BAC","BTS_DUT","LICENCE","MASTER","DOCTORAT","FORMATION_PRO"]).optional().or(z.literal("").transform(() => undefined)),
  salaireMin: z.coerce.number().positive().optional().or(z.literal(0).transform(() => undefined)),
  salaireMax: z.coerce.number().positive().optional().or(z.literal(0).transform(() => undefined)),
  salaireNonDivulgue: z.boolean().default(false),
  dateDebutPoste: emptyToUndefined,
  dateLimite: emptyToUndefined,
  competences: z.array(z.string()).max(20).default([]),
  langues: z.array(z.object({
    langue: z.string(),
    niveau: z.enum(["NOTIONS","INTERMEDIAIRE","COURANT","BILINGUE","LANGUE_MATERNELLE"])
  })).default([]),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || (session.user.role !== "RH" && session.user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const entreprise = await prisma.profilEntreprise.findUnique({ where: { userId: session.user.id } });
  if (!entreprise) return NextResponse.json({ error: "Profil entreprise introuvable" }, { status: 404 });

  const statut = req.nextUrl.searchParams.get("statut");
  const where: any = { entrepriseId: entreprise.id };
  if (statut) where.statut = statut;

  const offres = await prisma.offre.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { candidatures: true } } },
  });
  return NextResponse.json({ data: offres });
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "RH" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const entreprise = await prisma.profilEntreprise.findUnique({ where: { userId: session.user.id } });
    if (!entreprise) return NextResponse.json({ error: "Profil entreprise introuvable" }, { status: 404 });
    if (entreprise.isSuspendue) return NextResponse.json({ error: "Compte suspendu" }, { status: 403 });

    const body = createSchema.parse(await req.json());

    if (body.salaireMin && body.salaireMax && body.salaireMin > body.salaireMax) {
      return NextResponse.json({ error: "Salaire min > salaire max" }, { status: 422 });
    }

    const offre = await prisma.$transaction(async (tx: any) => {
      const o = await tx.offre.create({
        data: {
          entrepriseId: entreprise.id,
          titre: body.titre,
          description: body.description,
          profilRecherche: body.profilRecherche,
          avantages: body.avantages,
          secteur: body.secteur,
          ville: body.ville,
          adresse: body.adresse,
          contratType: body.contratType,
          nbrePostes: body.nbrePostes,
          niveauExperience: body.niveauExperience,
          niveauFormation: body.niveauFormation,
          salaireMin: body.salaireMin,
          salaireMax: body.salaireMax,
          salaireNonDivulgue: body.salaireNonDivulgue,
          dateDebutPoste: body.dateDebutPoste ? new Date(body.dateDebutPoste) : null,
          dateLimite: body.dateLimite ? new Date(body.dateLimite) : null,
          statut: "EN_ATTENTE",
        },
      });

      for (const nom of body.competences) {
        const comp = await tx.competence.upsert({ where: { nom }, create: { nom }, update: {} });
        await tx.offreCompetence.create({ data: { offreId: o.id, competenceId: comp.id } });
      }

      if (body.langues.length > 0) {
        await tx.offreLangue.createMany({ data: body.langues.map((l) => ({ offreId: o.id, ...l })) });
      }

      return o;
    });

    await notifierAdmins({
      type: "SYSTEME",
      titre: "Nouvelle offre à valider",
      contenu: `${entreprise.nomEntreprise} a soumis : ${body.titre}`,
      lien: "/admin/validation",
    });

    await logAction({ action: "OFFRE_SOUMISE", userId: session.user.id, cible: offre.id });

    return NextResponse.json({ success: true, data: { id: offre.id } }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues?.[0]?.message ?? "Données invalides" }, { status: 422 });
    }
    console.error("[RH OFFRES POST]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}