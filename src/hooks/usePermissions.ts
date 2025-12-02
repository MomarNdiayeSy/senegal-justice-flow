import { useApp, UserRole, Dossier, Audience } from "@/contexts/AppContext";

// Définition des permissions par rôle
export const ROLE_PERMISSIONS: Record<UserRole, {
  // Dossiers
  canViewAllDossiers: boolean;
  canCreateDossier: boolean;
  canEditDossier: boolean;
  canDeleteDossier: boolean;
  canManageDossierAccess: boolean;
  canArchiveDossier: boolean;
  // Audiences
  canViewAllAudiences: boolean;
  canCreateAudience: boolean;
  canEditAudience: boolean;
  canDeleteAudience: boolean;
  canReportAudience: boolean;
  // Utilisateurs
  canManageUsers: boolean;
  // Notifications
  canViewAllNotifications: boolean;
  // Stats et Audit
  canViewStats: boolean;
  canViewAuditLogs: boolean;
}> = {
  admin: {
    canViewAllDossiers: true,
    canCreateDossier: true,
    canEditDossier: true,
    canDeleteDossier: true,
    canManageDossierAccess: true,
    canArchiveDossier: true,
    canViewAllAudiences: true,
    canCreateAudience: true,
    canEditAudience: true,
    canDeleteAudience: true,
    canReportAudience: true,
    canManageUsers: true,
    canViewAllNotifications: true,
    canViewStats: true,
    canViewAuditLogs: true,
  },
  greffier: {
    canViewAllDossiers: true,
    canCreateDossier: true,
    canEditDossier: true,
    canDeleteDossier: false,
    canManageDossierAccess: true,
    canArchiveDossier: true,
    canViewAllAudiences: true,
    canCreateAudience: true,
    canEditAudience: true,
    canDeleteAudience: false,
    canReportAudience: true,
    canManageUsers: false,
    canViewAllNotifications: false,
    canViewStats: true,
    canViewAuditLogs: false,
  },
  juge: {
    canViewAllDossiers: false, // Seulement ses dossiers assignés
    canCreateDossier: false,
    canEditDossier: true, // Peut éditer ses dossiers
    canDeleteDossier: false,
    canManageDossierAccess: false,
    canArchiveDossier: false,
    canViewAllAudiences: false, // Seulement ses audiences
    canCreateAudience: false,
    canEditAudience: true, // Peut modifier ses audiences
    canDeleteAudience: false,
    canReportAudience: true,
    canManageUsers: false,
    canViewAllNotifications: false,
    canViewStats: true,
    canViewAuditLogs: false,
  },
  procureur: {
    canViewAllDossiers: false, // Seulement ses dossiers assignés
    canCreateDossier: false,
    canEditDossier: true,
    canDeleteDossier: false,
    canManageDossierAccess: false,
    canArchiveDossier: false,
    canViewAllAudiences: false,
    canCreateAudience: false,
    canEditAudience: false,
    canDeleteAudience: false,
    canReportAudience: false,
    canManageUsers: false,
    canViewAllNotifications: false,
    canViewStats: false,
    canViewAuditLogs: false,
  },
  avocat: {
    canViewAllDossiers: false, // Seulement les dossiers de ses clients
    canCreateDossier: false,
    canEditDossier: false, // Peut ajouter des pièces
    canDeleteDossier: false,
    canManageDossierAccess: false,
    canArchiveDossier: false,
    canViewAllAudiences: false,
    canCreateAudience: false,
    canEditAudience: false,
    canDeleteAudience: false,
    canReportAudience: false,
    canManageUsers: false,
    canViewAllNotifications: false,
    canViewStats: false,
    canViewAuditLogs: false,
  },
  justiciable: {
    canViewAllDossiers: false, // Seulement ses propres dossiers
    canCreateDossier: false,
    canEditDossier: false,
    canDeleteDossier: false,
    canManageDossierAccess: false,
    canArchiveDossier: false,
    canViewAllAudiences: false, // Seulement ses audiences
    canCreateAudience: false,
    canEditAudience: false,
    canDeleteAudience: false,
    canReportAudience: false,
    canManageUsers: false,
    canViewAllNotifications: false,
    canViewStats: false,
    canViewAuditLogs: false,
  },
};

export const usePermissions = () => {
  const { currentUser, dossiers, audiences } = useApp();

  const role = currentUser?.role;
  const permissions = role ? ROLE_PERMISSIONS[role] : null;

  // Vérifier si l'utilisateur a accès à un dossier spécifique
  const canAccessDossier = (dossier: Dossier): boolean => {
    if (!currentUser || !permissions) return false;
    
    // Admin et greffier voient tout
    if (permissions.canViewAllDossiers) return true;
    
    // Pour les autres rôles, vérifier s'ils sont dans la liste d'accès
    return dossier.accessList.includes(currentUser.id);
  };

  // Vérifier si l'utilisateur a accès à une audience spécifique
  const canAccessAudience = (audience: Audience): boolean => {
    if (!currentUser || !permissions) return false;
    
    // Admin et greffier voient tout
    if (permissions.canViewAllAudiences) return true;
    
    // Juge voit ses audiences
    if (currentUser.role === "juge" && audience.jugeId === currentUser.id) return true;
    
    // Procureur voit ses audiences
    if (currentUser.role === "procureur" && audience.procureurId === currentUser.id) return true;
    
    // Avocat voit les audiences de ses clients
    if (currentUser.role === "avocat" && audience.avocatIds.includes(currentUser.id)) return true;
    
    // Justiciable voit ses propres audiences
    if (currentUser.role === "justiciable" && audience.justiciableId === currentUser.id) return true;
    
    return false;
  };

  // Filtrer les dossiers accessibles
  const getAccessibleDossiers = (): Dossier[] => {
    if (!currentUser) return [];
    return dossiers.filter(canAccessDossier);
  };

  // Filtrer les audiences accessibles
  const getAccessibleAudiences = (): Audience[] => {
    if (!currentUser) return [];
    return audiences.filter(canAccessAudience);
  };

  // Vérifier si l'utilisateur peut modifier un dossier spécifique
  const canEditSpecificDossier = (dossier: Dossier): boolean => {
    if (!currentUser || !permissions) return false;
    if (!canAccessDossier(dossier)) return false;
    
    // Admin peut tout modifier
    if (currentUser.role === "admin") return true;
    
    // Greffier peut modifier tous les dossiers
    if (currentUser.role === "greffier") return true;
    
    // Juge peut modifier ses dossiers assignés
    if (currentUser.role === "juge") return permissions.canEditDossier;
    
    // Procureur peut éditer les dossiers où il est impliqué
    if (currentUser.role === "procureur") return permissions.canEditDossier;
    
    return false;
  };

  // Vérifier si l'utilisateur peut modifier une audience spécifique
  const canEditSpecificAudience = (audience: Audience): boolean => {
    if (!currentUser || !permissions) return false;
    if (!canAccessAudience(audience)) return false;
    
    // Admin peut tout modifier
    if (currentUser.role === "admin") return true;
    
    // Greffier peut modifier toutes les audiences
    if (currentUser.role === "greffier") return true;
    
    // Juge peut modifier ses audiences
    if (currentUser.role === "juge" && audience.jugeId === currentUser.id) {
      return permissions.canEditAudience;
    }
    
    return false;
  };

  return {
    permissions,
    role,
    currentUser,
    canAccessDossier,
    canAccessAudience,
    getAccessibleDossiers,
    getAccessibleAudiences,
    canEditSpecificDossier,
    canEditSpecificAudience,
    // Raccourcis pour les permissions communes
    canCreateDossier: permissions?.canCreateDossier ?? false,
    canCreateAudience: permissions?.canCreateAudience ?? false,
    canManageUsers: permissions?.canManageUsers ?? false,
    canViewStats: permissions?.canViewStats ?? false,
    canViewAuditLogs: permissions?.canViewAuditLogs ?? false,
  };
};
