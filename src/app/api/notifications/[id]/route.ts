// src/app/api/notifications/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  if (params.id === "read-all") {
    await prisma.notification.updateMany({
      where: { userId: session.user.id, isLue: false },
      data: { isLue: true },
    });
    return NextResponse.json({ success: true });
  }

  const notif = await prisma.notification.findUnique({ where: { id: params.id, userId: session.user.id } });
  if (!notif) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  await prisma.notification.update({ where: { id: params.id }, data: { isLue: true } });
  return NextResponse.json({ success: true });
}
