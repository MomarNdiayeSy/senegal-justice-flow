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
  pieces: Array<{
    id: string;
    nom: string;
    type: string;
    taille: string;
    dateAjout: string;
    ajoutePar: string;
  }>;
  audienceId?: string;
}

export interface Notification {
  id: string;
  type: "audience_creee" | "audience_reportee" | "audience_annulee" | "dossier_modifie";
  titre: string;
  message: string;
  date: string;
  destinataireId: string;
  lue: boolean;
  audienceId?: string;
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
  users: User[];
  audiences: Audience[];
  dossiers: Dossier[];
  notifications: Notification[];
  logs: LogAudit[];
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
  }
];

const mockAudiences: Audience[] = [
  {
    id: "1",
    numero: "AUD-2025-001",
    parties: "Diallo vs Sarr",
    date: "2025-02-15",
    heure: "09:00",
    salle: "Salle 1",
    jugeId: "3",
    avocatIds: ["4"],
    justiciableId: "5",
    statut: "prevue",
    qrCode: "https://ejustice.sn/audience/AUD-2025-001",
    historique: []
  },
  {
    id: "2",
    numero: "AUD-2025-002",
    parties: "État vs Fall",
    date: "2025-02-15",
    heure: "14:30",
    salle: "Salle 3",
    jugeId: "3",
    avocatIds: ["4"],
    justiciableId: "6",
    statut: "en_cours",
    qrCode: "https://ejustice.sn/audience/AUD-2025-002",
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
    pieces: [
      {
        id: "1",
        nom: "Contrat_vente.pdf",
        type: "application/pdf",
        taille: "2.3 MB",
        dateAjout: "2025-01-10",
        ajoutePar: "2"
      }
    ],
    audienceId: "1"
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
    audienceId: "1"
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
    setUsers(users.map(u => u.id === id ? { ...u, ...data } : u));
    addLog({
      userId: currentUser?.id || "system",
      action: "Modification utilisateur",
      details: `Utilisateur ${id} modifié`
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
        audienceId: newAudience.id
      });
    });
    
    addLog({
      userId: currentUser?.id || "system",
      action: "Création audience",
      details: `Audience ${audience.numero} créée`
    });
  };

  const updateAudience = (id: string, data: Partial<Audience>) => {
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

  const addDossier = (dossier: Omit<Dossier, "id" | "dateCreation">) => {
    const newDossier: Dossier = {
      ...dossier,
      id: Date.now().toString(),
      dateCreation: new Date().toISOString()
    };
    setDossiers([...dossiers, newDossier]);
    addLog({
      userId: currentUser?.id || "system",
      action: "Création dossier",
      details: `Dossier ${dossier.numero} créé`
    });
  };

  const updateDossier = (id: string, data: Partial<Dossier>) => {
    setDossiers(dossiers.map(d => d.id === id ? { ...d, ...data } : d));
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

  const addLog = (log: Omit<LogAudit, "id" | "date" | "ipAddress">) => {
    const newLog: LogAudit = {
      ...log,
      id: Date.now().toString(),
      date: new Date().toISOString(),
      ipAddress: "192.168.1." + Math.floor(Math.random() * 255)
    };
    setLogs([newLog, ...logs]);
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      setCurrentUser,
      users,
      audiences,
      dossiers,
      notifications,
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
