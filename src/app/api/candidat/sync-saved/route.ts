// app/api/candidat/sync-saved/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No session" });

  const { offerIds } = await req.json(); // IDs extraits du cookie 'saved_offers' par le client

  // Création massive des sauvegardes en ignorant les doublons
  await prisma.offreSauvegardee.createMany({
    data: offerIds.map((id: string) => ({
      userId: session.user.id,
      offreId: id
    })),
    skipDuplicates: true
  });

  return NextResponse.json({ success: true });
}