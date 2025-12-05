import { PrismaClient, Role, TypeDossier, StatutDossier, TypeAudience, StatutAudience, StatutDecision, TypeNotification, CanalNotification, StatutNotification } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Démarrage du seeding...');

  // Nettoyer la base de données
  console.log('🗑️  Nettoyage de la base de données...');
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.instruction.deleteMany();
  await prisma.decision.deleteMany();
  await prisma.pieceJointe.deleteMany();
  await prisma.audience.deleteMany();
  await prisma.historiqueDossier.deleteMany();
  await prisma.dossierAvocat.deleteMany();
  await prisma.dossier.deleteMany();
  await prisma.salle.deleteMany();
  await prisma.blogPost.deleteMany();
  await prisma.notificationPreference.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Base de données nettoyée');

  const passwordHash = await bcrypt.hash('Password123!', 10);
  const today = new Date().toISOString().split('T')[0];

  // ==================== UTILISATEURS ====================
  // Synchronisé avec mockUsers du frontend (AppContext.tsx)
  
  const usersData = [
    {
      id: '1',
      email: 'admin@justice.sn',
      role: Role.ADMIN,
      profile: {
        nom: 'Diallo',
        prenom: 'Amadou',
        telephone: '+221 77 123 45 67',
        tribunalAttache: 'Tribunal de Dakar',
      },
    },
    {
      id: '2',
      email: 'greffier@justice.sn',
      role: Role.GREFFIER,
      profile: {
        nom: 'Ndiaye',
        prenom: 'Fatou',
        telephone: '+221 77 234 56 78',
        tribunalAttache: 'Tribunal de Dakar',
      },
    },
    {
      id: '3',
      email: 'juge.ba@justice.sn',
      role: Role.JUGE,
      profile: {
        nom: 'Ba',
        prenom: 'Moussa',
        telephone: '+221 77 345 67 89',
        tribunalAttache: 'Tribunal de Dakar',
      },
    },
    {
      id: '4',
      email: 'avocat.sy@justice.sn',
      role: Role.AVOCAT,
      profile: {
        nom: 'Sy',
        prenom: 'Aissatou',
        telephone: '+221 77 456 78 90',
        numeroOrdre: 'AV-2024-001',
        barreau: 'Barreau de Dakar',
      },
    },
    {
      id: '5',
      email: 'procureur@justice.sn',
      role: Role.PROCUREUR,
      profile: {
        nom: 'Sow',
        prenom: 'Ibrahima',
        telephone: '+221 77 567 89 01',
        tribunalAttache: 'Tribunal de Dakar',
      },
    },
    {
      id: '6',
      email: 'justiciable@justice.sn',
      role: Role.JUSTICIABLE,
      profile: {
        nom: 'Fall',
        prenom: 'Mariama',
        telephone: '+221 77 678 90 12',
        adresse: 'Dakar, Sénégal',
      },
    },
  ];

  const createdUsers: Record<string, any> = {};
  const createdProfiles: Record<string, any> = {};

  for (const userData of usersData) {
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        passwordHash,
        emailVerified: true,
        isActive: true,
        profile: {
          create: {
            ...userData.profile,
          },
        },
        roles: {
          create: {
            role: userData.role,
          },
        },
      },
      include: { profile: true, roles: true },
    });
    createdUsers[userData.id] = user;
    createdProfiles[userData.id] = user.profile;
    console.log(`✅ Utilisateur créé: ${userData.email} (${userData.role})`);
  }

  // ==================== SALLES ====================
  const sallesData = [
    { nom: 'Salle 1', capacite: 100, equipements: ['Vidéoprojecteur', 'Microphones', 'Climatisation'], etage: 'RDC', batiment: 'Bâtiment Principal' },
    { nom: 'Salle 2', capacite: 80, equipements: ['Vidéoprojecteur', 'Microphones'], etage: '1er', batiment: 'Bâtiment Principal' },
    { nom: 'Salle 3', capacite: 50, equipements: ['Climatisation'], etage: '2ème', batiment: 'Bâtiment Principal' },
    { nom: 'Chambre du Conseil', capacite: 20, equipements: ['Table ronde', 'Climatisation'], etage: 'RDC', batiment: 'Annexe' },
    { nom: 'Salle des Flagrants Délits', capacite: 60, equipements: ['Box accusés', 'Microphones'], etage: 'RDC', batiment: 'Bâtiment Principal' },
  ];

  for (const salle of sallesData) {
    await prisma.salle.create({ data: salle });
    console.log(`✅ Salle créée: ${salle.nom}`);
  }

  // ==================== DOSSIERS ====================
  // Synchronisé avec mockDossiers du frontend
  
  const dossiersData = [
    {
      id: '1',
      numeroDossier: 'DOS-2025-001',
      titre: 'Affaire Diallo vs Sarr',
      description: 'Litige commercial concernant un contrat de vente',
      type: TypeDossier.COMMERCIAL,
      statut: StatutDossier.EN_INSTRUCTION,
      tribunal: 'Tribunal de Dakar',
      chambre: 'Chambre Commerciale',
      jugeId: createdProfiles['3']?.id,
      justiciableId: createdProfiles['6']?.id,
      avocatIds: [createdProfiles['4']?.id],
      createdBy: createdUsers['2']?.id,
    },
    {
      id: '2',
      numeroDossier: 'DOS-2025-002',
      titre: 'Affaire Ndiaye vs Transport Dakar',
      description: 'Accident de circulation avec dommages corporels',
      type: TypeDossier.CIVIL,
      statut: StatutDossier.EN_INSTRUCTION,
      tribunal: 'Tribunal de Dakar',
      chambre: 'Chambre Civile',
      jugeId: createdProfiles['3']?.id,
      procureurId: createdProfiles['5']?.id,
      justiciableId: createdProfiles['6']?.id,
      avocatIds: [createdProfiles['4']?.id],
      createdBy: createdUsers['2']?.id,
    },
  ];

  const createdDossiers: Record<string, any> = {};

  for (const dossierData of dossiersData) {
    const { avocatIds, id, ...dossierFields } = dossierData;
    
    const dossier = await prisma.dossier.create({
      data: dossierFields,
    });
    createdDossiers[id] = dossier;
    console.log(`✅ Dossier créé: ${dossierData.numeroDossier}`);

    // Ajouter historique
    await prisma.historiqueDossier.create({
      data: {
        dossierId: dossier.id,
        action: 'CREATION',
        details: { message: 'Dossier créé par le greffier' },
        userId: createdUsers['2']?.id,
      },
    });

    // Associer avocats
    if (avocatIds && avocatIds.length > 0) {
      for (const avocatId of avocatIds) {
        if (avocatId) {
          await prisma.dossierAvocat.create({
            data: {
              dossierId: dossier.id,
              avocatId: avocatId,
              principal: true,
            },
          });
        }
      }
    }
  }

  // Ajouter pièce jointe au premier dossier
  await prisma.pieceJointe.create({
    data: {
      dossierId: createdDossiers['1'].id,
      nom: 'Contrat_vente.pdf',
      description: 'Contrat de vente original',
      typeFichier: 'application/pdf',
      tailleFichier: 2400000, // 2.3 MB
      urlFichier: '/uploads/dossiers/DOS-2025-001/Contrat_vente.pdf',
      cheminStockage: './uploads/dossiers/DOS-2025-001/Contrat_vente.pdf',
      confidentiel: false,
      uploadePar: createdUsers['2']?.id,
    },
  });
  console.log('✅ Pièce jointe ajoutée au dossier DOS-2025-001');

  // ==================== AUDIENCES ====================
  // Synchronisé avec mockAudiences du frontend
  
  const audiencesData = [
    {
      id: '1',
      dossierId: createdDossiers['1'].id,
      dateAudience: new Date(today),
      heureDebut: '09:00',
      heureFin: '10:30',
      salle: 'Salle 1',
      typeAudience: TypeAudience.AUDIENCE_PUBLIQUE,
      statut: StatutAudience.TERMINEE,
      objetAudience: 'Diallo vs Sarr - Audience initiale',
      publicationWeb: true,
      createdBy: createdUsers['2']?.id,
    },
    {
      id: '2',
      dossierId: createdDossiers['2'].id,
      dateAudience: new Date(today),
      heureDebut: '10:30',
      heureFin: '12:00',
      salle: 'Salle 2',
      typeAudience: TypeAudience.AUDIENCE_PUBLIQUE,
      statut: StatutAudience.EN_COURS,
      objetAudience: 'État du Sénégal vs Fall - Plaidoirie',
      publicationWeb: true,
      createdBy: createdUsers['2']?.id,
    },
    {
      id: '3',
      dossierId: createdDossiers['1'].id,
      dateAudience: new Date(today),
      heureDebut: '14:00',
      heureFin: '15:30',
      salle: 'Salle 1',
      typeAudience: TypeAudience.AUDIENCE_PUBLIQUE,
      statut: StatutAudience.PROGRAMMEE,
      objetAudience: 'Ndiaye vs Compagnie Transport Dakar',
      publicationWeb: true,
      createdBy: createdUsers['2']?.id,
    },
    {
      id: '4',
      dossierId: createdDossiers['1'].id,
      dateAudience: new Date(today),
      heureDebut: '15:30',
      heureFin: '17:00',
      salle: 'Salle 3',
      typeAudience: TypeAudience.AUDIENCE_PUBLIQUE,
      statut: StatutAudience.PROGRAMMEE,
      objetAudience: 'Sy vs Banque Atlantique',
      publicationWeb: true,
      createdBy: createdUsers['2']?.id,
    },
    {
      id: '5',
      dossierId: createdDossiers['2'].id,
      dateAudience: new Date(today),
      heureDebut: '16:30',
      heureFin: '18:00',
      salle: 'Salle 2',
      typeAudience: TypeAudience.AUDIENCE_PUBLIQUE,
      statut: StatutAudience.REPORTEE,
      objetAudience: 'Thiam vs Ministère de l\'Éducation',
      motifReport: 'Absence de l\'avocat de la défense',
      publicationWeb: true,
      createdBy: createdUsers['2']?.id,
    },
  ];

  const createdAudiences: Record<string, any> = {};

  for (const audienceData of audiencesData) {
    const { id, ...audienceFields } = audienceData;
    const audience = await prisma.audience.create({
      data: audienceFields,
    });
    createdAudiences[id] = audience;
    console.log(`✅ Audience créée: ${audienceData.objetAudience}`);
  }

  // ==================== DECISIONS ====================
  await prisma.decision.create({
    data: {
      dossierId: createdDossiers['1'].id,
      numeroDecision: 'DEC-2025-001',
      typeDecision: 'Jugement',
      dateDelibere: new Date(),
      dispositif: 'Le tribunal ordonne l\'exécution du contrat de vente et condamne le défendeur aux dépens.',
      motivationComplete: 'Attendu que le contrat de vente a été régulièrement conclu entre les parties...',
      sensPrononce: 'Favorable au demandeur',
      statut: StatutDecision.BROUILLON,
      jugeId: createdProfiles['3']?.id,
    },
  });
  console.log('✅ Décision créée');

  // ==================== INSTRUCTIONS ====================
  await prisma.instruction.create({
    data: {
      type: 'Report audience',
      titre: 'Reporter l\'audience du dossier DOS-2025-002',
      description: 'Veuillez reporter l\'audience à une date ultérieure pour permettre au procureur de compléter son réquisitoire.',
      priorite: 'haute',
      jugeId: createdProfiles['3']?.id,
      dossierId: createdDossiers['2'].id,
    },
  });
  console.log('✅ Instruction créée');

  // ==================== NOTIFICATIONS ====================
  // Synchronisé avec mockNotifications du frontend
  
  await prisma.notification.create({
    data: {
      userId: createdUsers['4']?.id,
      type: TypeNotification.AUDIENCE_CREEE,
      titre: 'Nouvelle audience programmée',
      message: `Une audience a été programmée pour le ${today} à 09:00`,
      canal: CanalNotification.EMAIL,
      statut: StatutNotification.ENVOYE,
      lue: false,
      dossierId: createdDossiers['1'].id,
      audienceId: createdAudiences['1'].id,
      tentatives: 1,
    },
  });
  console.log('✅ Notification créée');

  // ==================== PRÉFÉRENCES NOTIFICATIONS ====================
  // Synchronisé avec mockNotificationPreferences du frontend
  
  const preferencesTemplate = [
    { type: TypeNotification.AUDIENCE_CREEE, canal: CanalNotification.EMAIL },
    { type: TypeNotification.AUDIENCE_CREEE, canal: CanalNotification.SMS },
    { type: TypeNotification.AUDIENCE_REPORTEE, canal: CanalNotification.EMAIL },
    { type: TypeNotification.AUDIENCE_ANNULEE, canal: CanalNotification.EMAIL },
    { type: TypeNotification.RAPPEL_AUDIENCE, canal: CanalNotification.EMAIL },
    { type: TypeNotification.DOSSIER_CREE, canal: CanalNotification.EMAIL },
    { type: TypeNotification.DOSSIER_MODIFIE, canal: CanalNotification.EMAIL },
    { type: TypeNotification.DOSSIER_CLOS, canal: CanalNotification.EMAIL },
    { type: TypeNotification.PIECE_AJOUTEE, canal: CanalNotification.EMAIL },
    { type: TypeNotification.DECISION_RENDUE, canal: CanalNotification.EMAIL },
    { type: TypeNotification.DECISION_VALIDEE, canal: CanalNotification.EMAIL },
    { type: TypeNotification.DECISION_PUBLIEE, canal: CanalNotification.EMAIL },
    { type: TypeNotification.INSTRUCTION_ENVOYEE, canal: CanalNotification.EMAIL },
    { type: TypeNotification.INSTRUCTION_TRAITEE, canal: CanalNotification.EMAIL },
    { type: TypeNotification.CONVOCATION_RECUE, canal: CanalNotification.EMAIL },
    { type: TypeNotification.ECHEANCE_PROCHE, canal: CanalNotification.EMAIL },
    { type: TypeNotification.ALERTE_SECURITE, canal: CanalNotification.EMAIL },
  ];

  for (const userId of ['1', '2', '3', '4', '5', '6']) {
    if (createdUsers[userId]) {
      for (const pref of preferencesTemplate) {
        await prisma.notificationPreference.create({
          data: {
            userId: createdUsers[userId].id,
            type: pref.type,
            canal: pref.canal,
            active: true,
          },
        });
      }
    }
  }
  console.log('✅ Préférences de notifications créées pour tous les utilisateurs');

  // ==================== AUDIT LOGS ====================
  // Synchronisé avec mockLogs du frontend
  
  await prisma.auditLog.create({
    data: {
      userId: createdUsers['1']?.id,
      action: 'LOGIN',
      entity: 'User',
      entityId: createdUsers['1']?.id,
      details: { message: 'Connexion réussie' },
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0',
    },
  });
  console.log('✅ Log d\'audit créé');

  // ==================== BLOG ====================
  await prisma.blogPost.create({
    data: {
      titre: 'Lancement de la plateforme e-Justice Sénégal',
      slug: 'lancement-ejustice-senegal',
      contenu: `
        Le Ministère de la Justice est fier d'annoncer le lancement de la nouvelle plateforme e-Justice Sénégal.
        
        Cette plateforme moderne permet aux citoyens de suivre leurs affaires en temps réel, 
        de recevoir des notifications sur l'évolution de leurs dossiers, et d'accéder aux informations 
        sur les audiences programmées.
        
        Les avocats peuvent gérer leurs clients et accéder aux documents de manière sécurisée.
        Les juges disposent d'outils pour rédiger et valider leurs décisions.
        Les greffiers ont accès à un tableau de bord complet pour gérer les audiences et les notifications.
        
        Bienvenue dans l'ère de la justice numérique au Sénégal!
      `,
      resume: 'Découvrez la nouvelle plateforme e-Justice qui modernise la justice sénégalaise.',
      auteurId: createdUsers['1']?.id,
      publie: true,
      datePublication: new Date(),
      tags: ['actualité', 'justice', 'numérique', 'sénégal'],
    },
  });
  console.log('✅ Article de blog créé');

  // ==================== RÉSUMÉ ====================
  console.log('\n🎉 Seeding terminé avec succès!');
  console.log('\n📧 Comptes de test créés (mot de passe: Password123!):');
  console.log('----------------------------------------------------------');
  console.log('  ADMIN        : admin@justice.sn');
  console.log('  GREFFIER     : greffier@justice.sn');
  console.log('  JUGE         : juge.ba@justice.sn');
  console.log('  AVOCAT       : avocat.sy@justice.sn');
  console.log('  PROCUREUR    : procureur@justice.sn');
  console.log('  JUSTICIABLE  : justiciable@justice.sn');
  console.log('----------------------------------------------------------');
  console.log('\n📂 Données créées:');
  console.log(`  - ${Object.keys(createdUsers).length} utilisateurs`);
  console.log(`  - ${sallesData.length} salles`);
  console.log(`  - ${Object.keys(createdDossiers).length} dossiers`);
  console.log(`  - ${Object.keys(createdAudiences).length} audiences`);
  console.log('  - 1 décision');
  console.log('  - 1 instruction');
  console.log('  - 1 notification');
  console.log('  - 1 article de blog');
  console.log('  - Préférences de notifications pour tous les utilisateurs');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
