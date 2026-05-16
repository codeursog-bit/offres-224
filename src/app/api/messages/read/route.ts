// src/app/api/messages/read/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const schema = z.object({ conversationId: z.string().cuid() });
  const { conversationId } = schema.parse(await req.json());

  const membre = await prisma.conversationMembre.findUnique({
    where: { conversationId_userId: { conversationId, userId: session.user.id } },
  });
  if (!membre) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  await prisma.conversationMembre.update({
    where: { conversationId_userId: { conversationId, userId: session.user.id } },
    data: { lastReadAt: new Date() },
  });

  return NextResponse.json({ success: true });
}
