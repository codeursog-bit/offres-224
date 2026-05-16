// src/app/api/notifications/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const since = req.nextUrl.searchParams.get("since");
  const page = parseInt(req.nextUrl.searchParams.get("page") ?? "1");
  const limit = 20;

  const where: any = { userId: session.user.id };
  if (since) where.createdAt = { gt: new Date(since) };

  const [notifications, nbNonLues] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.notification.count({ where: { userId: session.user.id, isLue: false } }),
  ]);

  return NextResponse.json({ data: notifications, nbNonLues });
}
