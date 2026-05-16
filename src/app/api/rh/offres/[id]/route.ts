// src/app/api/rh/offres/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/logger";
import { z } from "zod";

async function getOwnerEntreprise(userId: string, offreId: string) {
  const entreprise = await prisma.profilEntreprise.findUnique({ where: { userId } });
  if (!entreprise) return null;
  const offre = await prisma.offre.findUnique({ where: { id: offreId, entrepriseId: entreprise.id } });
  return offre ? { entreprise, offre } : null;
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "RH") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const owned = await getOwnerEntreprise(session.user.id, params.id);
    if (!owned) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

    if (!["BROUILLON","MODIFICATION"].includes(owned.offre.statut)) {
      return NextResponse.json({ error: "Modification impossible dans ce statut" }, { status: 400 });
    }

    const schema = z.object({
      titre: z.string().min(5).max(200).optional(),
      description: z.string().min(50).max(10000).optional(),
      profilRecherche: z.string().max(5000).optional(),
      avantages: z.string().max(2000).optional(),
      secteur: z.string().optional(),
      ville: z.string().optional(),
      salaireMin: z.number().positive().optional(),
      salaireMax: z.number().positive().optional(),
      dateLimite: z.string().optional(),
    });

    const body = schema.parse(await req.json());
    const updated = await prisma.offre.update({ where: { id: params.id }, data: { ...body, dateLimite: body.dateLimite ? new Date(body.dateLimite) : undefined } });

    await logAction({ action: "OFFRE_MODIFIEE", userId: session.user.id, cible: params.id });
    return NextResponse.json({ data: updated });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: (err as any).issues?.[0]?.message ?? "Données invalides" }, { status: 422 });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session || session.user.role !== "RH") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const owned = await getOwnerEntreprise(session.user.id, params.id);
  if (!owned) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  // Soft delete — archiver l'offre et ses candidatures
  await prisma.$transaction([
    prisma.offre.update({ where: { id: params.id }, data: { statut: "ARCHIVEE" } }),
    prisma.candidature.updateMany({ where: { offreId: params.id }, data: { statut: "ARCHIVEE" } }),
  ]);

  await logAction({ action: "OFFRE_ARCHIVEE", userId: session.user.id, cible: params.id });
  return NextResponse.json({ success: true });
}
