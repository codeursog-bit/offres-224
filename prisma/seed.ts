import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Super Admin
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@offres242.cg";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "Admin@242!Secure";

  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        role: "SUPER_ADMIN",
        emailVerified: new Date(),
      },
    });
    console.log(`Super Admin créé: ${adminEmail}`);
  } else {
    console.log(`Super Admin déjà existant: ${adminEmail}`);
  }

  // Paramètres par défaut
  const parametres = [
    { cle: "MAX_OFFRES_GRATUITES_RH", valeur: "5", type: "int", label: "Nb max offres gratuites/mois par RH" },
    { cle: "DELAI_VALIDATION_H", valeur: "24", type: "int", label: "Délai de validation en heures" },
    { cle: "MAX_CANDIDATURES_PAR_OFFRE", valeur: "500", type: "int", label: "Nb max candidatures par offre" },
    { cle: "MAX_CV_SIZE_MB", valeur: "5", type: "int", label: "Taille max CV en Mo" },
    { cle: "MAX_ALERTES_PAR_CANDIDAT", valeur: "10", type: "int", label: "Nb max alertes emploi par candidat" },
    { cle: "VALIDATION_MANUELLE", valeur: "true", type: "bool", label: "Validation manuelle des offres obligatoire" },
    { cle: "INSCRIPTION_RH_APPROBATION", valeur: "false", type: "bool", label: "Inscription RH nécessite approbation" },
    { cle: "AVIS_ACTIVES", valeur: "true", type: "bool", label: "Système d'avis activé" },
    { cle: "MODE_MAINTENANCE", valeur: "false", type: "bool", label: "Mode maintenance" },
    { cle: "EMAIL_FROM", valeur: "noreply@offres242.cg", type: "string", label: "Email expéditeur" },
    { cle: "EMAIL_FROM_NAME", valeur: "Offres Emploi 242", type: "string", label: "Nom expéditeur" },
  ];

  for (const p of parametres) {
    await prisma.parametre.upsert({
      where: { cle: p.cle },
      create: p,
      update: {},
    });
  }
  console.log(`${parametres.length} paramètres initialisés`);

  // Compétences de base
  const competences = [
    "Microsoft Office", "Excel avancé", "Word", "PowerPoint",
    "Comptabilité", "SAGE", "Gestion de projet", "Leadership",
    "Anglais professionnel", "Français", "Lingala",
    "Forage pétrolier", "Sécurité HSSE", "AutoCAD",
    "JavaScript", "Python", "React", "Node.js", "SQL",
    "Soudure", "Plomberie", "Électricité", "BTP",
    "Médecine générale", "Soins infirmiers", "Pharmacie",
    "Enseignement", "Droit", "Marketing digital", "Ressources humaines",
  ];

  let created = 0;
  for (const nom of competences) {
    const existing = await prisma.competence.findUnique({ where: { nom } });
    if (!existing) { await prisma.competence.create({ data: { nom } }); created++; }
  }
  console.log(`${created} compétences créées (${competences.length - created} existantes)`);

  console.log("Seed terminé !");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });