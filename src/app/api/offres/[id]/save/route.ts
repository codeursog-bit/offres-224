// src/app/api/offres/[id]/save/route.ts — Sauvegarder / retirer une offre
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import { prisma } from "@/lib/prisma";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const existing = await prisma.offreSauvegardee.findUnique({
    where: { userId_offreId: { userId: session.user.id, offreId: params.id } },
  });

  if (existing) {
    await prisma.offreSauvegardee.delete({ where: { id: existing.id } });
    return NextResponse.json({ saved: false });
  }

  await prisma.offreSauvegardee.create({ data: { userId: session.user.id, offreId: params.id } });
  return NextResponse.json({ saved: true });
}
