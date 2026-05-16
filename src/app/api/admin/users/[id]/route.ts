// src/app/api/admin/users/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/logger";
import bcrypt from "bcryptjs";
import { z } from "zod";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "SUPER_ADMIN") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const schema = z.object({
      action: z.enum(["ban","unban","promoteAdmin","resetPassword","verify","suspend","unsuspend"]),
      motif: z.string().max(500).optional(),
      banDureeJours: z.number().optional(),
      mdpTemp: z.string().min(8).optional(),
    });
    const body = schema.parse(await req.json());

    const target = await prisma.user.findUnique({ where: { id: params.id } });
    if (!target) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    if (target.id === session.user.id && body.action === "ban") {
      return NextResponse.json({ error: "Impossible de se bannir soi-même" }, { status: 400 });
    }

    let updateData: any = {};
    switch (body.action) {
      case "ban":
        updateData = {
          isBanned: true, banReason: body.motif,
          banExpireAt: body.banDureeJours ? new Date(Date.now() + body.banDureeJours * 86400000) : null,
          bannedBy: session.user.id,
        };
        break;
      case "unban":
        updateData = { isBanned: false, banReason: null, banExpireAt: null, bannedBy: null };
        break;
      case "promoteAdmin":
        updateData = { role: "SUPER_ADMIN" };
        break;
      case "resetPassword":
        if (!body.mdpTemp) return NextResponse.json({ error: "mdpTemp requis" }, { status: 422 });
        updateData = { passwordHash: await bcrypt.hash(body.mdpTemp, 12) };
        break;
    }

    await prisma.user.update({ where: { id: params.id }, data: updateData });
    await logAction({ action: `USER_${body.action.toUpperCase()}`, userId: session.user.id, cible: params.id, details: { motif: body.motif } });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: (err as any).issues?.[0]?.message ?? "Données invalides" }, { status: 422 });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session || session.user.role !== "SUPER_ADMIN") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  if (params.id === session.user.id) return NextResponse.json({ error: "Impossible de se supprimer" }, { status: 400 });

  await prisma.$transaction([
    prisma.candidature.updateMany({ where: { candidatId: params.id }, data: { statut: "ARCHIVEE" } }),
    prisma.offre.updateMany({
      where: { entreprise: { userId: params.id } },
      data: { statut: "ARCHIVEE" },
    }),
    prisma.user.delete({ where: { id: params.id } }),
  ]);

  await logAction({ action: "USER_SUPPRIME", userId: session.user.id, cible: params.id });
  return NextResponse.json({ success: true });
}
