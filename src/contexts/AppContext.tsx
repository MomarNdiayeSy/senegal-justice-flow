import { createContext, useContext, useState, ReactNode, useEffect } from "react";

// Types
export type UserRole = "admin" | "greffier" | "juge" | "procureur" | "avocat" | "justiciable";

export interface User {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: UserRole;
  telephone: string;
  tribunal: string;
  photo?: string;
  dateCreation: string;
  dernierAcces?: string;
}

export interface Audience {
  id: string;
  numero: string;
  parties: string;
  date: string;
  heure: string;
  salle: string;
  jugeId: string;
  procureurId?: string;
  avocatIds: string[];
  justiciableId: string;
  statut: "prevue" | "en_cours" | "reportee" | "terminee";
  dossierId?: string;
  qrCode: string;
  historique: Array<{
    date: string;
    action: string;
    userId: string;
  }>;
}

export interface Dossier {
  id: string;
  numero: string;
  titre: string;
  description: string;
  dateCreation: string;
  statut: "ouvert" | "en_cours" | "clos" | "archive";
  // Parties du dossier
  justiciableId?: string;
  avocatIds?: string[];
  jugeId?: string;
  procureurId?: string;
  pieces: Array<{
    id: string;
    nom: string;
    type: string;
    taille: string;
    dateAjout: string;
    ajoutePar: string;
    version: number;
    historique: Array<{
      version: number;
      date: string;
      action: string;
      userId: string;
    }>;
  }>;
  audienceId?: string;
  accessList: string[]; // IDs des utilisateurs ayant accès
  historique: Array<{
    date: string;
    action: string;
    details: string;
    userId: string;
  }>;
}

export interface NotificationPreferences {
  userId: string;
  canaux: {
    email: boolean;
    sms: boolean;
    whatsapp: boolean;
  };
  types: {
    // Audiences
    audience_creee: boolean;
    audience_reportee: boolean;
    audience_annulee: boolean;
    rappel_audience: boolean;
    // Dossiers
    dossier_cree: boolean;
    dossier_modifie: boolean;
    dossier_clos: boolean;
    piece_ajoutee: boolean;
    assignation_nouveau_dossier: boolean;
    // Décisions
    decision_rendue: boolean;
    decision_validee: boolean;
    decision_publiee: boolean;
    // Instructions
    instruction_envoyee: boolean;
    instruction_traitee: boolean;
    // Procédures
    convocation_recue: boolean;
    echeance_proche: boolean;
    commentaire_ajoute: boolean;
    // Administration
    utilisateur_cree: boolean;
    alerte_securite: boolean;
  };
}

export type NotificationType = 
  | "audience_creee" | "audience_reportee" | "audience_annulee" | "rappel_audience"
  | "dossier_cree" | "dossier_modifie" | "dossier_clos" | "piece_ajoutee" | "assignation_nouveau_dossier"
  | "decision_rendue" | "decision_validee" | "decision_publiee"
  | "instruction_envoyee" | "instruction_traitee"
  | "convocation_recue" | "echeance_proche" | "commentaire_ajoute"
  | "utilisateur_cree" | "alerte_securite";

export interface Notification {
  id: string;
  type: NotificationType;
  titre: string;
  message: string;
  date: string;
  destinataireId: string;
  lue: boolean;
  audienceId?: string;
  dossierId?: string;
  decisionId?: string;
  statut: "envoye" | "echoue" | "en_attente";
  canal: "email" | "sms" | "whatsapp";
  tentatives: number;
  derniereTentative?: string;
  erreur?: string;
  priorite?: "haute" | "normale" | "basse";
}

export interface LogAudit {
  id: string;
  userId: string;
  action: string;
  details: string;
  date: string;
  ipAddress: string;
}

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  logout: () => void;
  login: (email: string, password: string) => { success: boolean; user?: User; message?: string };
  users: User[];
  audiences: Audience[];
  dossiers: Dossier[];
  notifications: Notification[];
  logs: LogAudit[];
  notificationPreferences: NotificationPreferences[];
  addUser: (user: Omit<User, "id" | "dateCreation">) => void;
  updateUser: (id: string, data: Partial<User>) => void;
  deleteUser: (id: string) => void;
  addAudience: (audience: Omit<Audience, "id" | "qrCode" | "historique">) => void;
  updateAudience: (id: string, data: Partial<Audience>) => void;
  deleteAudience: (id: string) => void;
  addDossier: (dossier: Omit<Dossier, "id" | "dateCreation">) => void;
  updateDossier: (id: string, data: Partial<Dossier>) => void;
  addNotification: (notification: Omit<Notification, "id" | "date" | "lue">) => void;
  markNotificationAsRead: (id: string) => void;
  retryNotification: (id: string) => void;
  updateNotificationPreferences: (userId: string, preferences: Partial<NotificationPreferences>) => void;
  addLog: (log: Omit<LogAudit, "id" | "date" | "ipAddress">) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Mock data
const mockUsers: User[] = [
  {
    id: "1",
    email: "admin@justice.sn",
    nom: "Diallo",
    prenom: "Amadou",
    role: "admin",
    telephone: "+221 77 123 45 67",
    tribunal: "Tribunal de Dakar",
    dateCreation: "2024-01-01",
    dernierAcces: new Date().toISOString()
  },
  {
    id: "2",
    email: "greffier@justice.sn",
    nom: "Ndiaye",
    prenom: "Fatou",
    role: "greffier",
    telephone: "+221 77 234 56 78",
    tribunal: "Tribunal de Dakar",
    dateCreation: "2024-01-15"
  },
  {
    id: "3",
    email: "juge.ba@justice.sn",
    nom: "Ba",
    prenom: "Moussa",
    role: "juge",
    telephone: "+221 77 345 67 89",
    tribunal: "Tribunal de Dakar",
    dateCreation: "2024-02-01"
  },
  {
    id: "4",
    email: "avocat.sy@justice.sn",
    nom: "Sy",
    prenom: "Aissatou",
    role: "avocat",
    telephone: "+221 77 456 78 90",
    tribunal: "Barreau de Dakar",
    dateCreation: "2024-02-10"
  },
  {
    id: "5",
    email: "procureur@justice.sn",
    nom: "Sow",
    prenom: "Ibrahima",
    role: "procureur",
    telephone: "+221 77 567 89 01",
    tribunal: "Tribunal de Dakar",
    dateCreation: "2024-02-15"
  },
  {
    id: "6",
    email: "justiciable@justice.sn",
    nom: "Fall",
    prenom: "Mariama",
    role: "justiciable",
    telephone: "+221 77 678 90 12",
    tribunal: "N/A",
    dateCreation: "2024-03-01"
  }
];

const mockAudiences: Audience[] = [
  {
    id: "1",
    numero: "AUD-2025-001",
    parties: "Diallo vs Sarr",
    date: new Date().toISOString().split('T')[0],
    heure: "09:00",
    salle: "Salle 1",
    jugeId: "3",
    avocatIds: ["4"],
    justiciableId: "6",
    statut: "terminee",
    qrCode: "https://ejustice.sn/audience/AUD-2025-001",
    historique: []
  },
  {
    id: "2",
    numero: "AUD-2025-002",
    parties: "État du Sénégal vs Fall",
    date: new Date().toISOString().split('T')[0],
    heure: "10:30",
    salle: "Salle 2",
    jugeId: "3",
    procureurId: "5",
    avocatIds: ["4"],
    justiciableId: "6",
    statut: "en_cours",
    qrCode: "https://ejustice.sn/audience/AUD-2025-002",
    historique: []
  },
  {
    id: "3",
    numero: "AUD-2025-003",
    parties: "Ndiaye vs Compagnie Transport Dakar",
    date: new Date().toISOString().split('T')[0],
    heure: "14:00",
    salle: "Salle 1",
    jugeId: "3",
    avocatIds: ["4"],
    justiciableId: "6",
    statut: "prevue",
    qrCode: "https://ejustice.sn/audience/AUD-2025-003",
    historique: []
  },
  {
    id: "4",
    numero: "AUD-2025-004",
    parties: "Sy vs Banque Atlantique",
    date: new Date().toISOString().split('T')[0],
    heure: "15:30",
    salle: "Salle 3",
    jugeId: "3",
    avocatIds: ["4"],
    justiciableId: "6",
    statut: "prevue",
    qrCode: "https://ejustice.sn/audience/AUD-2025-004",
    historique: []
  },
  {
    id: "5",
    numero: "AUD-2025-005",
    parties: "Thiam vs Ministère de l'Éducation",
    date: new Date().toISOString().split('T')[0],
    heure: "16:30",
    salle: "Salle 2",
    jugeId: "3",
    procureurId: "5",
    avocatIds: ["4"],
    justiciableId: "6",
    statut: "reportee",
    qrCode: "https://ejustice.sn/audience/AUD-2025-005",
    historique: []
  }
];

const mockDossiers: Dossier[] = [
  {
    id: "1",
    numero: "DOS-2025-001",
    titre: "Affaire Diallo vs Sarr",
    description: "Litige commercial concernant un contrat de vente",
    dateCreation: "2025-01-10",
    statut: "en_cours",
    justiciableId: "6",
    avocatIds: ["4"],
    jugeId: "3",
    pieces: [
      {
        id: "1",
        nom: "Contrat_vente.pdf",
        type: "application/pdf",
        taille: "2.3 MB",
        dateAjout: "2025-01-10",
        ajoutePar: "2",
        version: 1,
        historique: [
          {
            version: 1,
            date: "2025-01-10",
            action: "Version initiale",
            userId: "2"
          }
        ]
      }
    ],
    audienceId: "1",
    accessList: ["1", "2", "3", "4", "6"],
    historique: [
      {
        date: "2025-01-10",
        action: "Création du dossier",
        details: "Dossier créé avec pièce jointe initiale",
        userId: "2"
      }
    ]
  },
  {
    id: "2",
    numero: "DOS-2025-002",
    titre: "Affaire Ndiaye vs Transport Dakar",
    description: "Accident de circulation avec dommages corporels",
    dateCreation: "2025-01-12",
    statut: "en_cours",
    justiciableId: "6",
    avocatIds: ["4"],
    jugeId: "3",
    procureurId: "5",
    pieces: [],
    accessList: ["1", "2", "3", "4", "5", "6"],
    historique: [
      {
        date: "2025-01-12",
        action: "Création du dossier",
        details: "Dossier ouvert suite à plainte",
        userId: "2"
      }
    ]
  }
];

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "audience_creee",
    titre: "Nouvelle audience programmée",
    message: "Une audience a été programmée pour le 15/02/2025 à 09:00",
    date: new Date().toISOString(),
    destinataireId: "4",
    lue: false,
    audienceId: "1",
    statut: "envoye",
    canal: "email",
    tentatives: 1
  }
];

const mockNotificationPreferences: NotificationPreferences[] = [
  {
    userId: "1",
    canaux: { email: true, sms: true, whatsapp: false },
    types: { 
      audience_creee: true, 
      audience_reportee: true, 
      audience_annulee: true,
      rappel_audience: true,
      dossier_cree: true,
      dossier_modifie: true,
      dossier_clos: true,
      piece_ajoutee: true,
      assignation_nouveau_dossier: true,
      decision_rendue: true,
      decision_validee: true,
      decision_publiee: true,
      instruction_envoyee: true,
      instruction_traitee: true,
      convocation_recue: true,
      echeance_proche: true,
      commentaire_ajoute: false,
      utilisateur_cree: true,
      alerte_securite: true
    }
  },
  {
    userId: "2",
    canaux: { email: true, sms: false, whatsapp: false },
    types: { 
      audience_creee: true, 
      audience_reportee: true, 
      audience_annulee: true,
      rappel_audience: true,
      dossier_cree: true,
      dossier_modifie: true,
      dossier_clos: true,
      piece_ajoutee: true,
      assignation_nouveau_dossier: true,
      decision_rendue: true,
      decision_validee: true,
      decision_publiee: true,
      instruction_envoyee: true,
      instruction_traitee: true,
      convocation_recue: true,
      echeance_proche: true,
      commentaire_ajoute: false,
      utilisateur_cree: false,
      alerte_securite: true
    }
  },
  {
    userId: "3",
    canaux: { email: true, sms: true, whatsapp: true },
    types: { 
      audience_creee: true, 
      audience_reportee: true, 
      audience_annulee: true,
      rappel_audience: true,
      dossier_cree: true,
      dossier_modifie: true,
      dossier_clos: true,
      piece_ajoutee: true,
      assignation_nouveau_dossier: true,
      decision_rendue: true,
      decision_validee: true,
      decision_publiee: true,
      instruction_envoyee: true,
      instruction_traitee: true,
      convocation_recue: true,
      echeance_proche: true,
      commentaire_ajoute: false,
      utilisateur_cree: false,
      alerte_securite: true
    }
  },
  {
    userId: "4",
    canaux: { email: true, sms: true, whatsapp: false },
    types: { 
      audience_creee: true, 
      audience_reportee: true, 
      audience_annulee: true,
      rappel_audience: true,
      dossier_cree: true,
      dossier_modifie: false,
      dossier_clos: true,
      piece_ajoutee: true,
      assignation_nouveau_dossier: false,
      decision_rendue: true,
      decision_validee: false,
      decision_publiee: true,
      instruction_envoyee: false,
      instruction_traitee: false,
      convocation_recue: true,
      echeance_proche: true,
      commentaire_ajoute: false,
      utilisateur_cree: false,
      alerte_securite: false
    }
  }
];

const mockLogs: LogAudit[] = [
  {
    id: "1",
    userId: "1",
    action: "Connexion",
    details: "Connexion réussie",
    date: new Date().toISOString(),
    ipAddress: "192.168.1.1"
  }
];

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [audiences, setAudiences] = useState<Audience[]>(mockAudiences);
  const [dossiers, setDossiers] = useState<Dossier[]>(mockDossiers);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences[]>(mockNotificationPreferences);
  const [logs, setLogs] = useState<LogAudit[]>(mockLogs);

  // Load from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("currentUser");
    }
  }, [currentUser]);

  const addUser = (user: Omit<User, "id" | "dateCreation">) => {
    const newUser: User = {
      ...user,
      id: Date.now().toString(),
      dateCreation: new Date().toISOString()
    };
    setUsers([...users, newUser]);
    addLog({
      userId: currentUser?.id || "system",
      action: "Création utilisateur",
      details: `Utilisateur ${newUser.nom} ${newUser.prenom} créé`
    });
  };

  const updateUser = (id: string, data: Partial<User>) => {
    const user = users.find(u => u.id === id);
    setUsers(users.map(u => u.id === id ? { ...u, ...data } : u));
    
    // Update current user if it's the same user
    if (currentUser?.id === id) {
      setCurrentUser({ ...currentUser, ...data });
    }
    
    addLog({
      userId: currentUser?.id || "system",
      action: "Modification utilisateur",
      details: `Profil de ${user?.prenom} ${user?.nom} modifié`
    });
  };

  const deleteUser = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
    addLog({
      userId: currentUser?.id || "system",
      action: "Suppression utilisateur",
      details: `Utilisateur ${id} supprimé`
    });
  };

  const addAudience = (audience: Omit<Audience, "id" | "qrCode" | "historique">) => {
    const newAudience: Audience = {
      ...audience,
      id: Date.now().toString(),
      qrCode: `https://ejustice.sn/audience/${audience.numero}`,
      historique: [{
        date: new Date().toISOString(),
        action: "Création",
        userId: currentUser?.id || "system"
      }]
    };
    setAudiences([...audiences, newAudience]);
    
    // Create notifications for concerned parties
    [audience.jugeId, ...audience.avocatIds, audience.justiciableId].forEach(userId => {
      addNotification({
        type: "audience_creee",
        titre: "Nouvelle audience",
        message: `Audience ${audience.numero} programmée pour le ${audience.date} à ${audience.heure}`,
        destinataireId: userId,
        audienceId: newAudience.id,
        statut: "envoye",
        canal: "email",
        tentatives: 1
      });
    });
    
    addLog({
      userId: currentUser?.id || "system",
      action: "Création audience",
      details: `Audience ${audience.numero} créée`
    });
  };

  const updateAudience = (id: string, data: Partial<Audience>) => {
    const audience = audiences.find(a => a.id === id);
    const wasRescheduled = audience && data.statut === "reportee" && audience.statut !== "reportee";
    
    setAudiences(audiences.map(a => {
      if (a.id === id) {
        const updatedAudience = { 
          ...a, 
          ...data,
          historique: [
            ...a.historique,
            {
              date: new Date().toISOString(),
              action: "Modification",
              userId: currentUser?.id || "system"
            }
          ]
        };
        
        // Send notifications if audience was rescheduled
        if (wasRescheduled && audience) {
          [audience.jugeId, ...audience.avocatIds, audience.justiciableId].forEach(userId => {
            addNotification({
              type: "audience_reportee",
              titre: "Audience reportée",
              message: `L'audience ${audience.numero} a été reportée. Nouvelle date: ${data.date || audience.date} à ${data.heure || audience.heure}`,
              destinataireId: userId,
              audienceId: id,
              statut: "envoye",
              canal: "email",
              tentatives: 1
            });
          });
        }
        
        return updatedAudience;
      }
      return a;
    }));
    
    addLog({
      userId: currentUser?.id || "system",
      action: "Modification audience",
      details: `Audience ${id} modifiée`
    });
  };

  const deleteAudience = (id: string) => {
    setAudiences(audiences.filter(a => a.id !== id));
    addLog({
      userId: currentUser?.id || "system",
      action: "Suppression audience",
      details: `Audience ${id} supprimée`
    });
  };

  const addDossier = (dossier: Omit<Dossier, "id" | "dateCreation" | "historique">) => {
    const newDossier: Dossier = {
      ...dossier,
      id: Date.now().toString(),
      dateCreation: new Date().toISOString(),
      historique: [
        {
          date: new Date().toISOString(),
          action: "Création du dossier",
          details: `Dossier ${dossier.numero} créé`,
          userId: currentUser?.id || "system"
        }
      ]
    };
    setDossiers([...dossiers, newDossier]);
    
    // Envoyer notifications aux parties concernées
    const partiesToNotify = [
      dossier.justiciableId,
      dossier.jugeId,
      dossier.procureurId,
      ...(dossier.avocatIds || [])
    ].filter((id): id is string => !!id && id !== currentUser?.id);
    
    partiesToNotify.forEach(userId => {
      addNotification({
        type: "dossier_cree",
        titre: "Nouveau dossier assigné",
        message: `Vous avez été assigné au dossier ${dossier.numero}: ${dossier.titre}`,
        destinataireId: userId,
        dossierId: newDossier.id,
        statut: "envoye",
        canal: "email",
        tentatives: 1
      });
    });
    
    addLog({
      userId: currentUser?.id || "system",
      action: "Création dossier",
      details: `Dossier ${dossier.numero} créé`
    });
  };

  const updateDossier = (id: string, data: Partial<Dossier>) => {
    const dossier = dossiers.find(d => d.id === id);
    if (!dossier) return;
    
    const wasStatusChanged = data.statut && dossier.statut !== data.statut;
    const wasPiecesAdded = data.pieces && data.pieces.length > dossier.pieces.length;
    
    setDossiers(dossiers.map(d => {
      if (d.id === id) {
        const updatedDossier = { 
          ...d, 
          ...data,
          historique: [
            ...d.historique,
            {
              date: new Date().toISOString(),
              action: "Modification du dossier",
              details: `Dossier ${d.numero} modifié`,
              userId: currentUser?.id || "system"
            }
          ]
        };
        return updatedDossier;
      }
      return d;
    }));
    
    // Notifications aux parties concernées
    const partiesToNotify = [
      dossier.justiciableId,
      dossier.jugeId,
      dossier.procureurId,
      ...(dossier.avocatIds || [])
    ].filter((id): id is string => !!id && id !== currentUser?.id);
    
    // Notification si statut changé (clos ou archivé)
    if (wasStatusChanged && (data.statut === "clos" || data.statut === "archive")) {
      partiesToNotify.forEach(userId => {
        addNotification({
          type: "dossier_clos",
          titre: "Dossier clôturé",
          message: `Le dossier ${dossier.numero} a été ${data.statut === "clos" ? "clôturé" : "archivé"}.`,
          destinataireId: userId,
          dossierId: id,
          statut: "envoye",
          canal: "email",
          tentatives: 1
        });
      });
    }
    
    // Notification si nouvelles pièces ajoutées
    if (wasPiecesAdded) {
      partiesToNotify.forEach(userId => {
        addNotification({
          type: "piece_ajoutee",
          titre: "Nouvelle pièce ajoutée",
          message: `Une nouvelle pièce a été ajoutée au dossier ${dossier.numero}.`,
          destinataireId: userId,
          dossierId: id,
          statut: "envoye",
          canal: "email",
          tentatives: 1
        });
      });
    }
    
    addLog({
      userId: currentUser?.id || "system",
      action: "Modification dossier",
      details: `Dossier ${id} modifié`
    });
  };

  const addNotification = (notification: Omit<Notification, "id" | "date" | "lue">) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      date: new Date().toISOString(),
      lue: false
    };
    setNotifications([...notifications, newNotification]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, lue: true } : n));
  };

  const retryNotification = (id: string) => {
    setNotifications(notifications.map(n => {
      if (n.id === id) {
        return {
          ...n,
          statut: Math.random() > 0.3 ? "envoye" : "echoue",
          tentatives: n.tentatives + 1,
          derniereTentative: new Date().toISOString(),
          erreur: Math.random() > 0.3 ? undefined : "Échec de l'envoi - Service temporairement indisponible"
        } as Notification;
      }
      return n;
    }));
    
    addLog({
      userId: currentUser?.id || "system",
      action: "Re-tentative notification",
      details: `Re-tentative d'envoi de la notification ${id}`
    });
  };

  const updateNotificationPreferences = (userId: string, preferences: Partial<NotificationPreferences>) => {
    const existingPref = notificationPreferences.find(p => p.userId === userId);
    
    if (existingPref) {
      setNotificationPreferences(notificationPreferences.map(p => 
        p.userId === userId ? { ...p, ...preferences } : p
      ));
    } else {
      const newPref: NotificationPreferences = {
        userId,
        canaux: preferences.canaux || { email: true, sms: false, whatsapp: false },
        types: preferences.types || { 
          audience_creee: true, 
          audience_reportee: true, 
          audience_annulee: true,
          rappel_audience: true,
          dossier_cree: true,
          dossier_modifie: true,
          dossier_clos: true,
          piece_ajoutee: true,
          assignation_nouveau_dossier: true,
          decision_rendue: true,
          decision_validee: true,
          decision_publiee: true,
          instruction_envoyee: true,
          instruction_traitee: true,
          convocation_recue: true,
          echeance_proche: true,
          commentaire_ajoute: false,
          utilisateur_cree: false,
          alerte_securite: true
        }
      };
      setNotificationPreferences([...notificationPreferences, newPref]);
    }
    
    addLog({
      userId: currentUser?.id || "system",
      action: "Préférences notifications",
      details: `Préférences de notification modifiées pour l'utilisateur ${userId}`
    });
  };

  const addLog = (log: Omit<LogAudit, "id" | "date" | "ipAddress">) => {
    const newLog: LogAudit = {
      ...log,
      id: Date.now().toString(),
      date: new Date().toISOString(),
      ipAddress: "192.168.1." + Math.floor(Math.random() * 255)
    };
    setLogs([newLog, ...logs]);
  };

  const login = (email: string, password: string) => {
    const user = users.find(u => u.email === email);
    
    if (!user) {
      // Log failed login attempt
      addLog({
        userId: "system",
        action: "Connexion échouée",
        details: `Tentative de connexion avec l'email: ${email} (utilisateur inexistant)`
      });
      return { success: false, message: "Email ou mot de passe incorrect" };
    }
    
    // Simulation de vérification de mot de passe (en production, utilisez un hash)
    // Pour les tests, le mot de passe est "123456" pour tous les utilisateurs
    if (password !== "123456") {
      // Log failed login attempt
      addLog({
        userId: user.id,
        action: "Connexion échouée",
        details: `Tentative de connexion échouée pour ${user.prenom} ${user.nom} (mot de passe incorrect)`
      });
      return { success: false, message: "Email ou mot de passe incorrect" };
    }
    
    // Update user last access
    const updatedUser = { ...user, dernierAcces: new Date().toISOString() };
    setUsers(users.map(u => u.id === user.id ? updatedUser : u));
    setCurrentUser(updatedUser);
    
    // Log successful login
    addLog({
      userId: user.id,
      action: "Connexion",
      details: `${user.prenom} ${user.nom} (${user.role}) s'est connecté avec succès`
    });
    
    return { success: true, user: updatedUser };
  };

  const logout = () => {
    if (currentUser) {
      addLog({
        userId: currentUser.id,
        action: "Déconnexion",
        details: "Déconnexion de l'utilisateur"
      });
    }
    setCurrentUser(null);
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      setCurrentUser,
      logout,
      login,
      users,
      audiences,
      dossiers,
      notifications,
      notificationPreferences,
      logs,
      addUser,
      updateUser,
      deleteUser,
      addAudience,
      updateAudience,
      deleteAudience,
      addDossier,
      updateDossier,
      addNotification,
      markNotificationAsRead,
      retryNotification,
      updateNotificationPreferences,
      addLog
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
};
