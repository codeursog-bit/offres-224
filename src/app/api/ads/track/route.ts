// src/app/api/ads/track/route.ts — Tracker impressions/clics
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createHash } from "crypto";
import { z } from "zod";

// Rate limiting in-memory (utiliser Redis en prod multi-instance)
const rateLimitMap = new Map<string, { imp: number; clk: number; ts: number }>();

const schema = z.object({
  adId: z.string().cuid(),
  event: z.enum(["IMPRESSION", "CLICK", "DISMISS"]),
});

export async function POST(req: NextRequest) {
  try {
    const body = schema.parse(await req.json());
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const ipHash = createHash("sha256").update(ip + process.env.IP_SALT || "default-salt-change-me").digest("hex");
    const key = `${ipHash}:${body.adId}`;
    const now = Date.now();

    // Rate limit
    const rl = rateLimitMap.get(key);
    if (rl && now - rl.ts < 3600000) {
      if (body.event === "IMPRESSION" && rl.imp >= 1) return NextResponse.json({ skipped: true });
      if (body.event === "CLICK" && rl.clk >= 5) return NextResponse.json({ skipped: true });
    }

    const entry = rl && now - rl.ts < 3600000 ? rl : { imp: 0, clk: 0, ts: now };
    if (body.event === "IMPRESSION") entry.imp++;
    if (body.event === "CLICK") entry.clk++;
    rateLimitMap.set(key, entry);

    // Créer le log
    await prisma.adEventLog.create({
      data: {
        adId: body.adId,
        event: body.event,
        ipHash,
        userAgent: req.headers.get("user-agent") ?? undefined,
      },
    });

    if (body.event === "CLICK") {
      await prisma.ad.update({ where: { id: body.adId }, data: { clicksCount: { increment: 1 } } });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: "Invalid" }, { status: 422 });
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
