// src/app/api/admin/signalements/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/logger";
import { z } from "zod";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "SUPER_ADMIN") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const schema = z.object({
      statut: z.enum(["EN_COURS","RESOLU","REJETE"]),
      resolution: z.string().max(1000).optional(),
      actionRapide: z.enum(["archiver_offre","suspendre_entreprise","bannir_candidat"]).optional(),
      cibleId: z.string().optional(),
      motif: z.string().max(500).optional(),
    });
    const body = schema.parse(await req.json());

    const signalement = await prisma.signalement.findUnique({ where: { id: params.id } });
    if (!signalement) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

    // Action rapide
    if (body.actionRapide && body.cibleId) {
      if (body.actionRapide === "archiver_offre") {
        await prisma.offre.update({ where: { id: body.cibleId }, data: { statut: "ARCHIVEE" } });
      } else if (body.actionRapide === "suspendre_entreprise") {
        await prisma.profilEntreprise.update({ where: { id: body.cibleId }, data: { isSuspendue: true, suspendueRaison: body.motif } });
        await prisma.offre.updateMany({ where: { entrepriseId: body.cibleId, statut: "PUBLIEE" }, data: { statut: "ARCHIVEE" } });
      } else if (body.actionRapide === "bannir_candidat") {
        await prisma.user.update({ where: { id: body.cibleId }, data: { isBanned: true, banReason: body.motif, bannedBy: session.user.id } });
      }
    }

    await prisma.signalement.update({
      where: { id: params.id },
      data: { statut: body.statut, resolution: body.resolution, traitePar: session.user.id, traiteAt: new Date() },
    });

    await logAction({ action: `SIGNALEMENT_${body.statut}`, userId: session.user.id, cible: params.id });
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: (err as any).issues?.[0]?.message ?? "Données invalides" }, { status: 422 });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
