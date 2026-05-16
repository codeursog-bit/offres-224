-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "emailVerified" DATETIME,
    "passwordHash" TEXT,
    "role" TEXT NOT NULL DEFAULT 'CANDIDAT',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isBanned" BOOLEAN NOT NULL DEFAULT false,
    "banReason" TEXT,
    "banExpireAt" DATETIME,
    "bannedBy" TEXT,
    "lastLoginAt" DATETIME,
    "lastLoginIp" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" DATETIME NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ProfilCandidat" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "titreProfessionnel" TEXT,
    "photoUrl" TEXT,
    "ville" TEXT,
    "telephone" TEXT,
    "linkedin" TEXT,
    "bio" TEXT,
    "cvFileUrl" TEXT,
    "cvGeneratedUrl" TEXT,
    "niveauFormation" TEXT,
    "niveauExperience" TEXT,
    "salaireSouhaite" INTEGER,
    "disponibilite" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "profilComplete" INTEGER NOT NULL DEFAULT 0,
    "vuesCeMois" INTEGER NOT NULL DEFAULT 0,
    "secteurPrincipal" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProfilCandidat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Experience" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profilId" TEXT NOT NULL,
    "poste" TEXT NOT NULL,
    "entreprise" TEXT NOT NULL,
    "ville" TEXT,
    "dateDebut" DATETIME NOT NULL,
    "dateFin" DATETIME,
    "description" TEXT,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Experience_profilId_fkey" FOREIGN KEY ("profilId") REFERENCES "ProfilCandidat" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FormationCandidat" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profilId" TEXT NOT NULL,
    "diplome" TEXT NOT NULL,
    "ecole" TEXT NOT NULL,
    "ville" TEXT,
    "annee" INTEGER,
    "mention" TEXT,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "FormationCandidat_profilId_fkey" FOREIGN KEY ("profilId") REFERENCES "ProfilCandidat" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Competence" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nom" TEXT NOT NULL,
    "secteur" TEXT
);

-- CreateTable
CREATE TABLE "ProfilCompetence" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profilId" TEXT NOT NULL,
    "competenceId" TEXT NOT NULL,
    "niveau" TEXT,
    CONSTRAINT "ProfilCompetence_profilId_fkey" FOREIGN KEY ("profilId") REFERENCES "ProfilCandidat" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProfilCompetence_competenceId_fkey" FOREIGN KEY ("competenceId") REFERENCES "Competence" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProfilLangue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profilId" TEXT NOT NULL,
    "langue" TEXT NOT NULL,
    "niveau" TEXT NOT NULL,
    CONSTRAINT "ProfilLangue_profilId_fkey" FOREIGN KEY ("profilId") REFERENCES "ProfilCandidat" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProfilEntreprise" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "nomEntreprise" TEXT NOT NULL,
    "secteur" TEXT,
    "tailleEntreprise" TEXT,
    "description" TEXT,
    "logoUrl" TEXT,
    "siteWeb" TEXT,
    "adresse" TEXT,
    "ville" TEXT,
    "numeroRCCM" TEXT,
    "isVerifiee" BOOLEAN NOT NULL DEFAULT false,
    "verifieeAt" DATETIME,
    "verifieeBy" TEXT,
    "isSuspendue" BOOLEAN NOT NULL DEFAULT false,
    "suspendueRaison" TEXT,
    "noteGlobale" REAL,
    "nbAvis" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProfilEntreprise_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Offre" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entrepriseId" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "profilRecherche" TEXT,
    "avantages" TEXT,
    "secteur" TEXT,
    "ville" TEXT NOT NULL,
    "adresse" TEXT,
    "contratType" TEXT NOT NULL,
    "nbrePostes" INTEGER NOT NULL DEFAULT 1,
    "niveauExperience" TEXT,
    "niveauFormation" TEXT,
    "salaireMin" INTEGER,
    "salaireMax" INTEGER,
    "salaireNonDivulgue" BOOLEAN NOT NULL DEFAULT false,
    "dateDebutPoste" DATETIME,
    "dateLimite" DATETIME,
    "statut" TEXT NOT NULL DEFAULT 'BROUILLON',
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "isUrgent" BOOLEAN NOT NULL DEFAULT false,
    "vues" INTEGER NOT NULL DEFAULT 0,
    "noteAdmin" TEXT,
    "motifRefus" TEXT,
    "valideePar" TEXT,
    "valideeAt" DATETIME,
    "refuseePar" TEXT,
    "refuseeAt" DATETIME,
    "publishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Offre_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "ProfilEntreprise" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OffreCompetence" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "offreId" TEXT NOT NULL,
    "competenceId" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "OffreCompetence_offreId_fkey" FOREIGN KEY ("offreId") REFERENCES "Offre" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OffreCompetence_competenceId_fkey" FOREIGN KEY ("competenceId") REFERENCES "Competence" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OffreLangue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "offreId" TEXT NOT NULL,
    "langue" TEXT NOT NULL,
    "niveau" TEXT NOT NULL,
    CONSTRAINT "OffreLangue_offreId_fkey" FOREIGN KEY ("offreId") REFERENCES "Offre" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OffreSauvegardee" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "offreId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OffreSauvegardee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OffreSauvegardee_offreId_fkey" FOREIGN KEY ("offreId") REFERENCES "Offre" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Candidature" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "offreId" TEXT NOT NULL,
    "candidatId" TEXT NOT NULL,
    "profilCandidatId" TEXT NOT NULL,
    "lettreMotivation" TEXT,
    "cvUrlSnapshot" TEXT,
    "pretentionSalariale" INTEGER,
    "source" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'ENVOYEE',
    "notesCandidatPrivee" TEXT,
    "notesRH" TEXT,
    "scoreCompatibilite" INTEGER,
    "isVuParRH" BOOLEAN NOT NULL DEFAULT false,
    "vuParRHAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Candidature_offreId_fkey" FOREIGN KEY ("offreId") REFERENCES "Offre" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Candidature_candidatId_fkey" FOREIGN KEY ("candidatId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Candidature_profilCandidatId_fkey" FOREIGN KEY ("profilCandidatId") REFERENCES "ProfilCandidat" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CandidatureStatutHistorique" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "candidatureId" TEXT NOT NULL,
    "statut" TEXT NOT NULL,
    "note" TEXT,
    "changedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CandidatureStatutHistorique_candidatureId_fkey" FOREIGN KEY ("candidatureId") REFERENCES "Candidature" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Entretien" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "candidatureId" TEXT NOT NULL,
    "dateHeure" DATETIME NOT NULL,
    "type" TEXT NOT NULL,
    "lieu" TEXT,
    "lienVideo" TEXT,
    "notes" TEXT,
    "isConfirme" BOOLEAN NOT NULL DEFAULT false,
    "isRealise" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Entretien_candidatureId_fkey" FOREIGN KEY ("candidatureId") REFERENCES "Candidature" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PipelineCandidat" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profilId" TEXT NOT NULL,
    "candidatureId" TEXT,
    "entrepriseId" TEXT NOT NULL,
    "etape" TEXT NOT NULL DEFAULT 'A_CONTACTER',
    "noteInterne" TEXT,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PipelineCandidat_profilId_fkey" FOREIGN KEY ("profilId") REFERENCES "ProfilCandidat" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PipelineCandidat_candidatureId_fkey" FOREIGN KEY ("candidatureId") REFERENCES "Candidature" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sujet" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ConversationMembre" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lastReadAt" DATETIME,
    CONSTRAINT "ConversationMembre_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ConversationMembre_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversationId" TEXT NOT NULL,
    "expediteurId" TEXT NOT NULL,
    "contenu" TEXT NOT NULL,
    "fichierUrl" TEXT,
    "fichierNom" TEXT,
    "fichierTaille" INTEGER,
    "statut" TEXT NOT NULL DEFAULT 'ENVOYE',
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Message_expediteurId_fkey" FOREIGN KEY ("expediteurId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "contenu" TEXT NOT NULL,
    "lien" TEXT,
    "isLue" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AlerteEmploi" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "motsCles" TEXT,
    "ville" TEXT,
    "secteur" TEXT,
    "contratType" TEXT,
    "salaireMin" INTEGER,
    "niveauExp" TEXT,
    "frequence" TEXT NOT NULL DEFAULT 'QUOTIDIENNE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "derniereEnvoi" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AlerteEmploi_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Ad" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nomCampagne" TEXT NOT NULL,
    "annonceur" TEXT NOT NULL,
    "placement" TEXT NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'BROUILLON',
    "priorite" INTEGER NOT NULL DEFAULT 5,
    "imageUrl" TEXT NOT NULL,
    "linkUrl" TEXT NOT NULL,
    "titre" TEXT,
    "description" TEXT,
    "ctaText" TEXT,
    "couleurFond" TEXT NOT NULL DEFAULT '#FFFFFF',
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "cibleVilles" TEXT,
    "cibleSecteurs" TEXT,
    "cibleUtilisateur" TEXT NOT NULL DEFAULT 'TOUS',
    "impressionsCount" INTEGER NOT NULL DEFAULT 0,
    "clicksCount" INTEGER NOT NULL DEFAULT 0,
    "creePar" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Ad_creePar_fkey" FOREIGN KEY ("creePar") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AdEventLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "adId" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "ipHash" TEXT NOT NULL,
    "userAgent" TEXT,
    "userId" TEXT,
    "city" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AdEventLog_adId_fkey" FOREIGN KEY ("adId") REFERENCES "Ad" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FormationCourse" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titre" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "formateur" TEXT NOT NULL,
    "secteur" TEXT,
    "niveau" TEXT NOT NULL DEFAULT 'DEBUTANT',
    "dureeHeures" INTEGER,
    "prix" INTEGER,
    "imageUrl" TEXT,
    "videoUrl" TEXT,
    "statut" TEXT NOT NULL DEFAULT 'BROUILLON',
    "nbInscrits" INTEGER NOT NULL DEFAULT 0,
    "note" REAL,
    "dateDebut" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "FormationModule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "formationId" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "contenu" TEXT NOT NULL,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "dureeMin" INTEGER,
    CONSTRAINT "FormationModule_formationId_fkey" FOREIGN KEY ("formationId") REFERENCES "FormationCourse" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FormationInscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "formationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "progression" INTEGER NOT NULL DEFAULT 0,
    "certifie" BOOLEAN NOT NULL DEFAULT false,
    "certifieAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FormationInscription_formationId_fkey" FOREIGN KEY ("formationId") REFERENCES "FormationCourse" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "FormationInscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FormationAvis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "formationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "note" INTEGER NOT NULL,
    "commentaire" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FormationAvis_formationId_fkey" FOREIGN KEY ("formationId") REFERENCES "FormationCourse" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "titre" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "extrait" TEXT,
    "contenu" TEXT NOT NULL,
    "categorie" TEXT NOT NULL,
    "imageUrl" TEXT,
    "auteur" TEXT NOT NULL,
    "tpsLecture" INTEGER,
    "vues" INTEGER NOT NULL DEFAULT 0,
    "isPublie" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "publieAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AvisEntreprise" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entrepriseId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "note" INTEGER NOT NULL,
    "titre" TEXT,
    "commentaire" TEXT,
    "isAnonyme" BOOLEAN NOT NULL DEFAULT false,
    "isVerifie" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AvisEntreprise_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "ProfilEntreprise" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AvisEntreprise_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Signalement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'OUVERT',
    "signaleurId" TEXT NOT NULL,
    "offreId" TEXT,
    "description" TEXT NOT NULL,
    "resolution" TEXT,
    "traitePar" TEXT,
    "traiteAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Signalement_signaleurId_fkey" FOREIGN KEY ("signaleurId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Signalement_offreId_fkey" FOREIGN KEY ("offreId") REFERENCES "Offre" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LogSysteme" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "niveau" TEXT NOT NULL DEFAULT 'INFO',
    "action" TEXT NOT NULL,
    "userId" TEXT,
    "cible" TEXT,
    "details" JSONB,
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LogSysteme_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Parametre" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cle" TEXT NOT NULL,
    "valeur" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'string',
    "label" TEXT,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_isBanned_idx" ON "User"("isBanned");

-- CreateIndex
CREATE INDEX "User_isActive_idx" ON "User"("isActive");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "ProfilCandidat_userId_key" ON "ProfilCandidat"("userId");

-- CreateIndex
CREATE INDEX "ProfilCandidat_ville_idx" ON "ProfilCandidat"("ville");

-- CreateIndex
CREATE INDEX "ProfilCandidat_niveauExperience_idx" ON "ProfilCandidat"("niveauExperience");

-- CreateIndex
CREATE INDEX "ProfilCandidat_secteurPrincipal_idx" ON "ProfilCandidat"("secteurPrincipal");

-- CreateIndex
CREATE INDEX "ProfilCandidat_isPublic_idx" ON "ProfilCandidat"("isPublic");

-- CreateIndex
CREATE INDEX "ProfilCandidat_profilComplete_idx" ON "ProfilCandidat"("profilComplete");

-- CreateIndex
CREATE INDEX "Experience_profilId_idx" ON "Experience"("profilId");

-- CreateIndex
CREATE INDEX "FormationCandidat_profilId_idx" ON "FormationCandidat"("profilId");

-- CreateIndex
CREATE UNIQUE INDEX "Competence_nom_key" ON "Competence"("nom");

-- CreateIndex
CREATE INDEX "Competence_nom_idx" ON "Competence"("nom");

-- CreateIndex
CREATE INDEX "Competence_secteur_idx" ON "Competence"("secteur");

-- CreateIndex
CREATE UNIQUE INDEX "ProfilCompetence_profilId_competenceId_key" ON "ProfilCompetence"("profilId", "competenceId");

-- CreateIndex
CREATE UNIQUE INDEX "ProfilLangue_profilId_langue_key" ON "ProfilLangue"("profilId", "langue");

-- CreateIndex
CREATE UNIQUE INDEX "ProfilEntreprise_userId_key" ON "ProfilEntreprise"("userId");

-- CreateIndex
CREATE INDEX "ProfilEntreprise_ville_idx" ON "ProfilEntreprise"("ville");

-- CreateIndex
CREATE INDEX "ProfilEntreprise_secteur_idx" ON "ProfilEntreprise"("secteur");

-- CreateIndex
CREATE INDEX "ProfilEntreprise_isVerifiee_idx" ON "ProfilEntreprise"("isVerifiee");

-- CreateIndex
CREATE INDEX "ProfilEntreprise_isSuspendue_idx" ON "ProfilEntreprise"("isSuspendue");

-- CreateIndex
CREATE INDEX "Offre_statut_idx" ON "Offre"("statut");

-- CreateIndex
CREATE INDEX "Offre_ville_idx" ON "Offre"("ville");

-- CreateIndex
CREATE INDEX "Offre_secteur_idx" ON "Offre"("secteur");

-- CreateIndex
CREATE INDEX "Offre_contratType_idx" ON "Offre"("contratType");

-- CreateIndex
CREATE INDEX "Offre_publishedAt_idx" ON "Offre"("publishedAt");

-- CreateIndex
CREATE INDEX "Offre_dateLimite_idx" ON "Offre"("dateLimite");

-- CreateIndex
CREATE INDEX "Offre_entrepriseId_idx" ON "Offre"("entrepriseId");

-- CreateIndex
CREATE INDEX "Offre_isPremium_idx" ON "Offre"("isPremium");

-- CreateIndex
CREATE INDEX "Offre_isUrgent_idx" ON "Offre"("isUrgent");

-- CreateIndex
CREATE UNIQUE INDEX "OffreCompetence_offreId_competenceId_key" ON "OffreCompetence"("offreId", "competenceId");

-- CreateIndex
CREATE UNIQUE INDEX "OffreLangue_offreId_langue_key" ON "OffreLangue"("offreId", "langue");

-- CreateIndex
CREATE INDEX "OffreSauvegardee_userId_idx" ON "OffreSauvegardee"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "OffreSauvegardee_userId_offreId_key" ON "OffreSauvegardee"("userId", "offreId");

-- CreateIndex
CREATE INDEX "Candidature_statut_idx" ON "Candidature"("statut");

-- CreateIndex
CREATE INDEX "Candidature_offreId_idx" ON "Candidature"("offreId");

-- CreateIndex
CREATE INDEX "Candidature_candidatId_idx" ON "Candidature"("candidatId");

-- CreateIndex
CREATE INDEX "Candidature_createdAt_idx" ON "Candidature"("createdAt");

-- CreateIndex
CREATE INDEX "Candidature_isVuParRH_idx" ON "Candidature"("isVuParRH");

-- CreateIndex
CREATE UNIQUE INDEX "Candidature_offreId_candidatId_key" ON "Candidature"("offreId", "candidatId");

-- CreateIndex
CREATE INDEX "CandidatureStatutHistorique_candidatureId_idx" ON "CandidatureStatutHistorique"("candidatureId");

-- CreateIndex
CREATE INDEX "Entretien_candidatureId_idx" ON "Entretien"("candidatureId");

-- CreateIndex
CREATE INDEX "Entretien_dateHeure_idx" ON "Entretien"("dateHeure");

-- CreateIndex
CREATE UNIQUE INDEX "PipelineCandidat_candidatureId_key" ON "PipelineCandidat"("candidatureId");

-- CreateIndex
CREATE INDEX "PipelineCandidat_entrepriseId_idx" ON "PipelineCandidat"("entrepriseId");

-- CreateIndex
CREATE INDEX "PipelineCandidat_etape_idx" ON "PipelineCandidat"("etape");

-- CreateIndex
CREATE INDEX "PipelineCandidat_profilId_idx" ON "PipelineCandidat"("profilId");

-- CreateIndex
CREATE INDEX "Conversation_updatedAt_idx" ON "Conversation"("updatedAt");

-- CreateIndex
CREATE INDEX "ConversationMembre_userId_idx" ON "ConversationMembre"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ConversationMembre_conversationId_userId_key" ON "ConversationMembre"("conversationId", "userId");

-- CreateIndex
CREATE INDEX "Message_conversationId_idx" ON "Message"("conversationId");

-- CreateIndex
CREATE INDEX "Message_expediteurId_idx" ON "Message"("expediteurId");

-- CreateIndex
CREATE INDEX "Message_createdAt_idx" ON "Message"("createdAt");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_isLue_idx" ON "Notification"("isLue");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE INDEX "AlerteEmploi_userId_idx" ON "AlerteEmploi"("userId");

-- CreateIndex
CREATE INDEX "AlerteEmploi_isActive_idx" ON "AlerteEmploi"("isActive");

-- CreateIndex
CREATE INDEX "AlerteEmploi_frequence_idx" ON "AlerteEmploi"("frequence");

-- CreateIndex
CREATE INDEX "AlerteEmploi_derniereEnvoi_idx" ON "AlerteEmploi"("derniereEnvoi");

-- CreateIndex
CREATE INDEX "Ad_placement_idx" ON "Ad"("placement");

-- CreateIndex
CREATE INDEX "Ad_statut_idx" ON "Ad"("statut");

-- CreateIndex
CREATE INDEX "Ad_isActive_idx" ON "Ad"("isActive");

-- CreateIndex
CREATE INDEX "Ad_startDate_endDate_idx" ON "Ad"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "Ad_priorite_idx" ON "Ad"("priorite");

-- CreateIndex
CREATE INDEX "AdEventLog_adId_idx" ON "AdEventLog"("adId");

-- CreateIndex
CREATE INDEX "AdEventLog_event_idx" ON "AdEventLog"("event");

-- CreateIndex
CREATE INDEX "AdEventLog_createdAt_idx" ON "AdEventLog"("createdAt");

-- CreateIndex
CREATE INDEX "AdEventLog_adId_event_createdAt_idx" ON "AdEventLog"("adId", "event", "createdAt");

-- CreateIndex
CREATE INDEX "AdEventLog_ipHash_adId_idx" ON "AdEventLog"("ipHash", "adId");

-- CreateIndex
CREATE INDEX "FormationCourse_statut_idx" ON "FormationCourse"("statut");

-- CreateIndex
CREATE INDEX "FormationCourse_secteur_idx" ON "FormationCourse"("secteur");

-- CreateIndex
CREATE INDEX "FormationCourse_niveau_idx" ON "FormationCourse"("niveau");

-- CreateIndex
CREATE INDEX "FormationModule_formationId_idx" ON "FormationModule"("formationId");

-- CreateIndex
CREATE INDEX "FormationInscription_userId_idx" ON "FormationInscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FormationInscription_formationId_userId_key" ON "FormationInscription"("formationId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "FormationAvis_formationId_userId_key" ON "FormationAvis"("formationId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Article_slug_key" ON "Article"("slug");

-- CreateIndex
CREATE INDEX "Article_slug_idx" ON "Article"("slug");

-- CreateIndex
CREATE INDEX "Article_categorie_idx" ON "Article"("categorie");

-- CreateIndex
CREATE INDEX "Article_isPublie_idx" ON "Article"("isPublie");

-- CreateIndex
CREATE INDEX "Article_isFeatured_idx" ON "Article"("isFeatured");

-- CreateIndex
CREATE INDEX "AvisEntreprise_entrepriseId_idx" ON "AvisEntreprise"("entrepriseId");

-- CreateIndex
CREATE UNIQUE INDEX "AvisEntreprise_entrepriseId_userId_key" ON "AvisEntreprise"("entrepriseId", "userId");

-- CreateIndex
CREATE INDEX "Signalement_statut_idx" ON "Signalement"("statut");

-- CreateIndex
CREATE INDEX "Signalement_type_idx" ON "Signalement"("type");

-- CreateIndex
CREATE INDEX "Signalement_createdAt_idx" ON "Signalement"("createdAt");

-- CreateIndex
CREATE INDEX "LogSysteme_niveau_idx" ON "LogSysteme"("niveau");

-- CreateIndex
CREATE INDEX "LogSysteme_action_idx" ON "LogSysteme"("action");

-- CreateIndex
CREATE INDEX "LogSysteme_createdAt_idx" ON "LogSysteme"("createdAt");

-- CreateIndex
CREATE INDEX "LogSysteme_userId_idx" ON "LogSysteme"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Parametre_cle_key" ON "Parametre"("cle");

-- CreateIndex
CREATE INDEX "Parametre_cle_idx" ON "Parametre"("cle");
