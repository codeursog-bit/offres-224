// src/app/api/admin/logs/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "SUPER_ADMIN") return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const niveau = req.nextUrl.searchParams.get("niveau");
  const action = req.nextUrl.searchParams.get("action");
  const userId = req.nextUrl.searchParams.get("userId");
  const from = req.nextUrl.searchParams.get("from");
  const to = req.nextUrl.searchParams.get("to");
  const page = parseInt(req.nextUrl.searchParams.get("page") ?? "1");
  const limit = 50;

  const where: any = {};
  if (niveau) where.niveau = niveau;
  if (action) where.action = { contains: action, mode: "insensitive" };
  if (userId) where.userId = userId;
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to) where.createdAt.lte = new Date(to);
  }

  const [logs, total] = await Promise.all([
    prisma.logSysteme.findMany({
      where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: "desc" },
      include: { user: { select: { email: true, profilCandidat: { select: { prenom: true, nom: true } } } } },
    }),
    prisma.logSysteme.count({ where }),
  ]);

  return NextResponse.json({ data: logs, total, page, pages: Math.ceil(total / limit) });
}
