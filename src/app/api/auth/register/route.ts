// src/app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/logger";
import bcrypt from "bcryptjs";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Minimum 8 caractères").max(128),
  role: z.enum(["CANDIDAT", "RH"]),
  prenom: z.string().min(1).max(50).optional(),
  nom: z.string().min(1).max(50).optional(),
  telephone: z.string().optional(),
  ville: z.string().optional(),
  nomEntreprise: z.string().min(2).max(100).optional(),
  secteur: z.string().optional(),
  numeroRCCM: z.string().optional(),
  nomResponsable: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    });
    if (existing) {
      return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await prisma.$transaction(async (tx: any) => {
      const u = await tx.user.create({
        data: {
          email: data.email.toLowerCase().trim(),
          passwordHash,
          role: data.role,
        },
      });

      if (data.role === "CANDIDAT") {
        await tx.profilCandidat.create({
          data: {
            userId: u.id,
            prenom: data.prenom ?? "",
            nom: data.nom ?? "",
            telephone: data.telephone,
            ville: data.ville,
            profilComplete: 20,
          },
        });
      } else {
        await tx.profilEntreprise.create({
          data: {
            userId: u.id,
            nomEntreprise: data.nomEntreprise ?? "",
            secteur: data.secteur,
            numeroRCCM: data.numeroRCCM,
            ville: data.ville,
          },
        });
      }

      return u;
    });

    await logAction({ action: "USER_REGISTER", userId: user.id, details: { role: data.role } });

    return NextResponse.json({ success: true, userId: user.id }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: (err as any).issues?.[0]?.message ?? "Données invalides" }, { status: 422 });
    }
    console.error("[REGISTER]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
