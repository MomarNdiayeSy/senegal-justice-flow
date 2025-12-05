import { PrismaClient, Role, TypeDossier, TypeAudience, StatutDecision } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Démarrage du seeding...');

  // Nettoyer la base de données
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

  console.log('🗑️  Base de données nettoyée');

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // Créer les utilisateurs avec leurs profils et rôles
  const users = [
    {
      email: 'admin@ejustice.sn',
      role: Role.ADMIN,
      profile: { nom: 'Diop', prenom: 'Mamadou', telephone: '+221771234567' },
    },
    {
      email: 'greffier@ejustice.sn',
      role: Role.GREFFIER,
      profile: { nom: 'Ndiaye', prenom: 'Fatou', telephone: '+221772234567', tribunalAttache: 'Tribunal de Grande Instance de Dakar' },
    },
    {
      email: 'juge@ejustice.sn',
      role: Role.JUGE,
      profile: { nom: 'Sow', prenom: 'Ibrahima', telephone: '+221773234567', tribunalAttache: 'Tribunal de Grande Instance de Dakar' },
    },
    {
      email: 'juge2@ejustice.sn',
      role: Role.JUGE,
      profile: { nom: 'Ba', prenom: 'Aminata', telephone: '+221773234568', tribunalAttache: 'Tribunal de Grande Instance de Dakar' },
    },
    {
      email: 'procureur@ejustice.sn',
      role: Role.PROCUREUR,
      profile: { nom: 'Fall', prenom: 'Ousmane', telephone: '+221774234567', tribunalAttache: 'Parquet de Dakar' },
    },
    {
      email: 'avocat@ejustice.sn',
      role: Role.AVOCAT,
      profile: { nom: 'Gueye', prenom: 'Aissatou', telephone: '+221775234567', numeroOrdre: 'AV-2024-001', barreau: 'Barreau de Dakar' },
    },
    {
      email: 'avocat2@ejustice.sn',
      role: Role.AVOCAT,
      profile: { nom: 'Mbaye', prenom: 'Cheikh', telephone: '+221775234568', numeroOrdre: 'AV-2024-002', barreau: 'Barreau de Dakar' },
    },
    {
      email: 'justiciable@ejustice.sn',
      role: Role.JUSTICIABLE,
      profile: { nom: 'Diallo', prenom: 'Moussa', telephone: '+221776234567', adresse: '123 Rue Blanchot, Dakar' },
    },
    {
      email: 'justiciable2@ejustice.sn',
      role: Role.JUSTICIABLE,
      profile: { nom: 'Sarr', prenom: 'Mariama', telephone: '+221776234568', adresse: '456 Avenue Pompidou, Dakar' },
    },
  ];

  const createdUsers: any = {};

  for (const userData of users) {
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        passwordHash,
        emailVerified: true,
        profile: { create: userData.profile },
        roles: { create: { role: userData.role } },
      },
      include: { profile: true, roles: true },
    });
    createdUsers[userData.role + (userData.email.includes('2') ? '2' : '')] = user;
    console.log(`✅ Utilisateur créé: ${userData.email} (${userData.role})`);
  }

  // Créer les salles
  const salles = [
    { nom: 'Salle A', capacite: 100, equipements: ['Vidéoprojecteur', 'Microphones', 'Climatisation'], etage: 'RDC', batiment: 'Bâtiment Principal' },
    { nom: 'Salle B', capacite: 80, equipements: ['Vidéoprojecteur', 'Microphones'], etage: '1er', batiment: 'Bâtiment Principal' },
    { nom: 'Salle C', capacite: 50, equipements: ['Climatisation'], etage: '2ème', batiment: 'Bâtiment Principal' },
    { nom: 'Chambre du Conseil', capacite: 20, equipements: ['Table ronde', 'Climatisation'], etage: 'RDC', batiment: 'Annexe' },
    { nom: 'Salle des Flagrants Délits', capacite: 60, equipements: ['Box accusés', 'Microphones'], etage: 'RDC', batiment: 'Bâtiment Principal' },
  ];

  for (const salle of salles) {
    await prisma.salle.create({ data: salle });
    console.log(`✅ Salle créée: ${salle.nom}`);
  }

  // Créer des dossiers
  const dossiers = [
    {
      numeroDossier: 'DOS-2024-001',
      titre: 'Affaire Diallo c/ État du Sénégal',
      description: 'Litige administratif concernant une expropriation',
      type: TypeDossier.ADMINISTRATIF,
      tribunal: 'Tribunal de Grande Instance de Dakar',
      chambre: 'Chambre Administrative',
      jugeId: createdUsers.JUGE.profile!.id,
      procureurId: createdUsers.PROCUREUR.profile!.id,
      justiciableId: createdUsers.JUSTICIABLE.profile!.id,
    },
    {
      numeroDossier: 'DOS-2024-002',
      titre: 'Affaire Sarr c/ Entreprise XYZ',
      description: 'Litige commercial pour rupture abusive de contrat',
      type: TypeDossier.COMMERCIAL,
      tribunal: 'Tribunal de Commerce de Dakar',
      chambre: 'Chambre Commerciale',
      jugeId: createdUsers.JUGE2.profile!.id,
      justiciableId: createdUsers.JUSTICIABLE2.profile!.id,
      montantLitige: 50000000,
    },
    {
      numeroDossier: 'DOS-2024-003',
      titre: 'Ministère Public c/ Inconnu',
      description: 'Affaire pénale - Vol avec effraction',
      type: TypeDossier.PENAL,
      tribunal: 'Tribunal de Grande Instance de Dakar',
      chambre: 'Chambre Correctionnelle',
      jugeId: createdUsers.JUGE.profile!.id,
      procureurId: createdUsers.PROCUREUR.profile!.id,
      justiciableId: createdUsers.JUSTICIABLE.profile!.id,
    },
  ];

  const createdDossiers: any[] = [];

  for (const dossierData of dossiers) {
    const dossier = await prisma.dossier.create({
      data: {
        ...dossierData,
        createdBy: createdUsers.GREFFIER.id,
      },
    });
    createdDossiers.push(dossier);
    console.log(`✅ Dossier créé: ${dossierData.numeroDossier}`);

    // Ajouter historique
    await prisma.historiqueDossier.create({
      data: {
        dossierId: dossier.id,
        action: 'CREATION',
        details: { message: 'Dossier créé par le greffier' },
        userId: createdUsers.GREFFIER.id,
      },
    });
  }

  // Associer avocats aux dossiers
  await prisma.dossierAvocat.create({
    data: {
      dossierId: createdDossiers[0].id,
      avocatId: createdUsers.AVOCAT.profile!.id,
      principal: true,
    },
  });

  await prisma.dossierAvocat.create({
    data: {
      dossierId: createdDossiers[1].id,
      avocatId: createdUsers.AVOCAT2.profile!.id,
      principal: true,
    },
  });

  console.log('✅ Avocats associés aux dossiers');

  // Créer des audiences
  const today = new Date();
  const audiences = [
    {
      dossierId: createdDossiers[0].id,
      dateAudience: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000), // Dans 7 jours
      heureDebut: '09:00',
      heureFin: '11:00',
      salle: 'Salle A',
      typeAudience: TypeAudience.AUDIENCE_PUBLIQUE,
      objetAudience: 'Audience de plaidoirie',
      createdBy: createdUsers.GREFFIER.id,
    },
    {
      dossierId: createdDossiers[1].id,
      dateAudience: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000), // Dans 14 jours
      heureDebut: '14:00',
      heureFin: '16:00',
      salle: 'Salle B',
      typeAudience: TypeAudience.AUDIENCE_PUBLIQUE,
      objetAudience: 'Audience de jugement',
      createdBy: createdUsers.GREFFIER.id,
    },
    {
      dossierId: createdDossiers[2].id,
      dateAudience: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000), // Dans 3 jours
      heureDebut: '10:00',
      heureFin: '12:00',
      salle: 'Salle des Flagrants Délits',
      typeAudience: TypeAudience.FLAGRANT_DELIT,
      objetAudience: 'Comparution immédiate',
      createdBy: createdUsers.GREFFIER.id,
    },
  ];

  for (const audienceData of audiences) {
    await prisma.audience.create({ data: audienceData });
    console.log(`✅ Audience créée pour le dossier ${audienceData.dossierId}`);
  }

  // Créer une décision
  await prisma.decision.create({
    data: {
      dossierId: createdDossiers[0].id,
      numeroDecision: 'DEC-2024-001',
      typeDecision: 'Jugement',
      dateDelibere: new Date(),
      dispositif: 'Le tribunal ordonne la restitution des terres au demandeur avec dommages et intérêts.',
      motivationComplete: 'Attendu que le demandeur a prouvé ses droits de propriété...',
      sensPrononce: 'Favorable au demandeur',
      statut: StatutDecision.BROUILLON,
      jugeId: createdUsers.JUGE.profile!.id,
    },
  });
  console.log('✅ Décision créée');

  // Créer des instructions
  await prisma.instruction.create({
    data: {
      type: 'Report audience',
      titre: 'Reporter l\'audience du 15 janvier',
      description: 'Veuillez reporter l\'audience à une date ultérieure pour permettre à la défense de préparer ses conclusions.',
      priorite: 'haute',
      jugeId: createdUsers.JUGE.profile!.id,
      dossierId: createdDossiers[0].id,
    },
  });
  console.log('✅ Instruction créée');

  // Créer des articles de blog
  await prisma.blogPost.create({
    data: {
      titre: 'Lancement de la plateforme e-Justice Sénégal',
      slug: 'lancement-ejustice-senegal',
      contenu: 'Le Ministère de la Justice est fier de lancer la nouvelle plateforme e-Justice pour moderniser les services judiciaires au Sénégal. Cette plateforme permettra aux citoyens de suivre leurs affaires en temps réel.',
      resume: 'Découvrez la nouvelle plateforme e-Justice qui modernise la justice sénégalaise.',
      auteurId: createdUsers.ADMIN.id,
      publie: true,
      datePublication: new Date(),
      tags: ['actualité', 'justice', 'numérique'],
    },
  });
  console.log('✅ Article de blog créé');

  // Créer des notifications de test
  await prisma.notification.create({
    data: {
      userId: createdUsers.JUSTICIABLE.id,
      type: 'AUDIENCE_CREEE',
      titre: 'Nouvelle audience programmée',
      message: 'Une audience a été programmée pour votre dossier DOS-2024-001',
      canal: 'IN_APP',
      statut: 'ENVOYE',
      dossierId: createdDossiers[0].id,
    },
  });
  console.log('✅ Notifications créées');

  console.log('\n🎉 Seeding terminé avec succès!');
  console.log('\n📧 Comptes de test créés:');
  console.log('---------------------------');
  users.forEach(u => {
    console.log(`  ${u.role.padEnd(12)} : ${u.email} / Password123!`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
