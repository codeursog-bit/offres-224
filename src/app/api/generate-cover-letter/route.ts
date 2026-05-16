// src/app/api/generate-cover-letter/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  offreId: z.string().cuid(),
  prenom: z.string().min(1),
  titrePro: z.string().optional(),
  experience: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const body = schema.parse(await req.json());

    const offre = await prisma.offre.findUnique({
      where: { id: body.offreId },
      include: { entreprise: { select: { nomEntreprise: true } } },
    });
    if (!offre) return NextResponse.json({ error: "Offre introuvable" }, { status: 404 });

    const lettre = genererLettre({
      prenom: body.prenom,
      titrePro: body.titrePro ?? "professionnel(le) motivé(e)",
      experience: body.experience ?? "",
      poste: offre.titre,
      entreprise: offre.entreprise.nomEntreprise,
      ville: offre.ville,
      secteur: offre.secteur ?? "",
    });

    return NextResponse.json({ content: lettre });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: (err as any).issues?.[0]?.message ?? "Données invalides" }, { status: 422 });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

function genererLettre(p: {
  prenom: string; titrePro: string; experience: string;
  poste: string; entreprise: string; ville: string; secteur: string;
}): string {
  const date = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  return `${p.ville}, le ${date}

Objet : Candidature au poste de ${p.poste}

Madame, Monsieur,

C'est avec un grand intérêt que je me permets de vous adresser ma candidature pour le poste de ${p.poste} au sein de votre entreprise ${p.entreprise}.

${p.titrePro !== "professionnel(le) motivé(e)" ? `En tant que ${p.titrePro}, j` : "J"}e possède une solide expérience dans le domaine ${p.secteur ? `de ${p.secteur}` : "de mon secteur"} et suis convaincu(e) que mes compétences correspondent aux exigences de ce poste.${p.experience ? `\n\n${p.experience}` : ""}

Votre entreprise m'attire particulièrement pour sa réputation et les valeurs qu'elle véhicule. Je serais honoré(e) de contribuer à son développement et de mettre mon expertise au service de vos équipes.

Disponible pour un entretien à votre convenance, je reste à votre disposition pour tout renseignement complémentaire.

Dans l'attente de votre réponse, veuillez agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

${p.prenom}`;
}
