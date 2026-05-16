// app/api/applications/[id]/relance/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Auth required" }, { status: 401 });

  const app = await prisma.candidature.findUnique({
    where: { id: params.id },
    include: { offre: true }
  });

  // Vérification : 1 seule relance possible tous les 7 jours
  // Logique de temps ici...

  await prisma.notification.create({
    data: {
      userId: app!.offre.entrepriseId,
      type: "SYSTEME",
      titre: "Relance de candidature",
      contenu: `Le candidat pour le poste ${app!.offre.titre} a envoyé une relance.`,
      lien: `/dashboard/rh/candidatures/${app!.id}`
    }
  });

  return NextResponse.json({ success: true });
}