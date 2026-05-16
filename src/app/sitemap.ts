// app/sitemap.ts
import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://offres-emploi242.cg';

  // Récupérer les IDs des offres publiées
  const offres = await prisma.offre.findMany({
    where: { statut: 'PUBLIEE' },
    select: { id: true, updatedAt: true }
  });

  const offreUrls = offres.map((o: any) => ({
    url: `${baseUrl}/offres/${o.id}`,
    lastModified: o.updatedAt,
  }));

  return [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/offres`, lastModified: new Date() },
    { url: `${baseUrl}/entreprises`, lastModified: new Date() },
    { url: `${baseUrl}/formations`, lastModified: new Date() },
    { url: `${baseUrl}/conseils`, lastModified: new Date() },
    ...offreUrls,
  ];
}