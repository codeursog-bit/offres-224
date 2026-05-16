// src/app/api/rh/candidatures/[id]/route.ts — Changer statut candidature
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import { prisma } from "@/lib/prisma";
import { notifierUser } from "@/lib/notifications";
import { logAction } from "@/lib/logger";
import { z } from "zod";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "RH") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const schema = z.object({
      statut: z.enum(["ENVOYEE","VUE","SHORTLISTED","ENTRETIEN_PREVU","ENTRETIEN_REALISE","OFFRE_RECUE","ACCEPTEE","REFUSEE","ARCHIVEE"]),
      notesRH: z.string().max(2000).optional(),
    });
    const body = schema.parse(await req.json());

    // Vérifier ownership
    const entreprise = await prisma.profilEntreprise.findUnique({ where: { userId: session.user.id } });
    if (!entreprise) return NextResponse.json({ error: "Profil entreprise introuvable" }, { status: 404 });

    const candidature = await prisma.candidature.findUnique({
      where: { id: params.id },
      include: { offre: true },
    });
    if (!candidature || candidature.offre.entrepriseId !== entreprise.id) {
      return NextResponse.json({ error: "Introuvable" }, { status: 404 });
    }

    const updated = await prisma.$transaction(async (tx: any) => {
      const c = await tx.candidature.update({
        where: { id: params.id },
        data: {
          statut: body.statut,
          notesRH: body.notesRH,
          isVuParRH: true,
          vuParRHAt: candidature.isVuParRH ? candidature.vuParRHAt : new Date(),
        },
      });
      await tx.candidatureStatutHistorique.create({
        data: { candidatureId: params.id, statut: body.statut, changedBy: session.user.id, note: body.notesRH },
      });
      return c;
    });

    // Notifier le candidat
    const messages: Record<string, string> = {
      VUE: "Votre candidature a été consultée",
      SHORTLISTED: "Vous êtes sélectionné(e) pour la prochaine étape",
      ENTRETIEN_PREVU: "Un entretien a été planifié",
      ACCEPTEE: "Félicitations ! Votre candidature a été retenue",
      REFUSEE: "Votre candidature n'a pas été retenue cette fois",
    };
    if (messages[body.statut]) {
      await notifierUser(candidature.candidatId, {
        type: "STATUT_CANDIDATURE",
        titre: messages[body.statut],
        contenu: `Pour l'offre : ${candidature.offre.titre}`,
        lien: `/dashboard/candidat/candidatures/${params.id}`,
      });
    }

    await logAction({ action: "STATUT_CANDIDATURE_CHANGE", userId: session.user.id, cible: params.id, details: { statut: body.statut } });
    return NextResponse.json({ data: updated });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: (err as any).issues?.[0]?.message ?? "Données invalides" }, { status: 422 });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
