// src/app/api/admin/notifications/broadcast/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/logger";
import { sseEmit } from "@/lib/notifications";
import { z } from "zod";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "SUPER_ADMIN") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const schema = z.object({
      titre: z.string().min(1).max(80),
      contenu: z.string().min(1).max(300),
      lien: z.string().url().optional(),
      cible: z.enum(["tous","candidats","rh","inactifs"]),
      ville: z.string().optional(),
    });
    const body = schema.parse(await req.json());

    const where: any = { isActive: true, isBanned: false };
    if (body.cible === "candidats") where.role = "CANDIDAT";
    else if (body.cible === "rh") where.role = "RH";
    else if (body.cible === "inactifs") where.lastLoginAt = { lt: new Date(Date.now() - 30 * 86400000) };

    const users = await prisma.user.findMany({ where, select: { id: true } });

    await prisma.notification.createMany({
      data: users.map((u: any) => ({
        userId: u.id, type: "SYSTEME" as const,
        titre: body.titre, contenu: body.contenu, lien: body.lien,
      })),
    });

    // SSE push
    users.forEach((u: any) => sseEmit(u.id, "notification", { titre: body.titre, contenu: body.contenu, lien: body.lien }));

    await logAction({ action: "NOTIFICATION_BROADCAST", userId: session.user.id, details: { cible: body.cible, nb: users.length } });
    return NextResponse.json({ success: true, nbEnvoye: users.length });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: (err as any).issues?.[0]?.message ?? "Données invalides" }, { status: 422 });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
