// src/app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import crypto from "crypto";

const schema = z.object({ email: z.string().email() });

export async function POST(req: NextRequest) {
  try {
    const { email } = schema.parse(await req.json());

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    // Toujours retourner success (sécurité — ne pas révéler si l'email existe)
    if (!user) return NextResponse.json({ success: true });

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600000); // 1h

    await prisma.verificationToken.upsert({
      where: { identifier: email },
      create: { identifier: email, token, expires },
      update: { token, expires },
    });

    // TODO: Envoyer email avec lien de reset
    // await sendEmail({ to: email, subject: "Réinitialisation mot de passe", body: `...${token}...` })
    console.log(`[RESET PASSWORD] Token pour ${email}: ${token}`);

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: (err as any).issues?.[0]?.message ?? "Données invalides" }, { status: 422 });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
