// src/app/api/admin/entreprises/[id]/route.ts
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
      action: z.enum(["verify","unverify","suspend","unsuspend"]),
      motif: z.string().max(500).optional(),
    });
    const body = schema.parse(await req.json());

    const entreprise = await prisma.profilEntreprise.findUnique({ where: { id: params.id } });
    if (!entreprise) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

    if (body.action === "verify") {
      await prisma.profilEntreprise.update({
        where: { id: params.id },
        data: { isVerifiee: true, verifieeBy: session.user.id, verifieeAt: new Date() },
      });
    } else if (body.action === "unverify") {
      await prisma.profilEntreprise.update({ where: { id: params.id }, data: { isVerifiee: false, verifieeBy: null, verifieeAt: null } });
    } else if (body.action === "suspend") {
      await prisma.$transaction([
        prisma.profilEntreprise.update({ where: { id: params.id }, data: { isSuspendue: true, suspendueRaison: body.motif } }),
        prisma.offre.updateMany({ where: { entrepriseId: params.id, statut: "PUBLIEE" }, data: { statut: "ARCHIVEE" } }),
      ]);
    } else {
      await prisma.profilEntreprise.update({ where: { id: params.id }, data: { isSuspendue: false, suspendueRaison: null } });
    }

    await logAction({ action: `ENTREPRISE_${body.action.toUpperCase()}`, userId: session.user.id, cible: params.id });
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: (err as any).issues?.[0]?.message ?? "Données invalides" }, { status: 422 });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session || session.user.role !== "SUPER_ADMIN") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const entreprise = await prisma.profilEntreprise.findUnique({ where: { id: params.id } });
  if (!entreprise) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  await prisma.$transaction([
    prisma.offre.updateMany({ where: { entrepriseId: params.id }, data: { statut: "ARCHIVEE" } }),
    prisma.user.delete({ where: { id: entreprise.userId } }),
  ]);

  await logAction({ action: "ENTREPRISE_SUPPRIMEE", userId: session.user.id, cible: params.id });
  return NextResponse.json({ success: true });
}
