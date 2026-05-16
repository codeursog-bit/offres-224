// src/app/api/admin/offres/[id]/statut/route.ts — Valider / refuser
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import { prisma } from "@/lib/prisma";
import { notifierUser } from "@/lib/notifications";
import { logAction } from "@/lib/logger";
import { z } from "zod";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "SUPER_ADMIN") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const schema = z.object({
      statut: z.enum(["PUBLIEE","REFUSEE","MODIFICATION"]),
      motifRefus: z.string().max(1000).optional(),
      noteAdmin: z.string().max(1000).optional(),
    });
    const body = schema.parse(await req.json());

    const offre = await prisma.offre.findUnique({
      where: { id: params.id },
      include: { entreprise: { include: { user: { select: { id: true } } } } },
    });
    if (!offre) return NextResponse.json({ error: "Offre introuvable" }, { status: 404 });

    const updateData: any = {
      statut: body.statut,
      noteAdmin: body.noteAdmin,
    };

    if (body.statut === "PUBLIEE") {
      updateData.valideePar = session.user.id;
      updateData.valideeAt = new Date();
      updateData.publishedAt = new Date();
    } else if (body.statut === "REFUSEE") {
      updateData.refuseePar = session.user.id;
      updateData.refuseeAt = new Date();
      updateData.motifRefus = body.motifRefus;
    } else {
      updateData.motifRefus = body.motifRefus;
    }

    await prisma.offre.update({ where: { id: params.id }, data: updateData });

    // Notifier le RH
    const notifMap = {
      PUBLIEE: { type: "OFFRE_VALIDEE" as const, titre: "Offre publiée !", contenu: `Votre offre "${offre.titre}" est maintenant en ligne.` },
      REFUSEE: { type: "OFFRE_REFUSEE" as const, titre: "Offre refusée", contenu: body.motifRefus ?? "Votre offre n'a pas été acceptée." },
      MODIFICATION: { type: "SYSTEME" as const, titre: "Modification demandée", contenu: body.motifRefus ?? "Des modifications sont nécessaires." },
    };
    await notifierUser(offre.entreprise.user.id, { ...notifMap[body.statut], lien: `/dashboard/rh/offres` });

    await logAction({ action: `OFFRE_${body.statut}`, userId: session.user.id, cible: params.id });
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: (err as any).issues?.[0]?.message ?? "Données invalides" }, { status: 422 });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
