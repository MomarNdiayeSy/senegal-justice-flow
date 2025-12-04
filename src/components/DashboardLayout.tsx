import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Scale, 
  Calendar, 
  BarChart3, 
  Monitor, 
  Users, 
  Menu, 
  X,
  LogOut,
  Settings,
  Bell,
  Shield,
  FileText,
  PenTool,
  History,
  MessageSquare,
  Building2,
  Home,
  Briefcase,
  Gavel,
  FolderOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useApp } from "@/contexts/AppContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface MenuSection {
  title: string;
  items: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    path: string;
  }[];
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, notifications, logout } = useApp();

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };
  
  const unreadNotifications = notifications.filter(
    n => !n.lue && (!currentUser || n.destinataireId === currentUser.id)
  ).length;

  // Menu organisé par sections selon le rôle
  const getMenuSections = (): MenuSection[] => {
    if (!currentUser) return [];

    const role = currentUser.role;
    const sections: MenuSection[] = [];

    // Section principale - commune à tous
    sections.push({
      title: "Principal",
      items: [
        { icon: Home, label: "Tableau de bord", path: `/${role}/dashboard` },
      ]
    });

    // Section Gestion - selon le rôle
    if (role === "admin") {
      sections.push({
        title: "Supervision Nationale",
        items: [
          { icon: BarChart3, label: "Statistiques", path: "/admin/stats" },
          { icon: Users, label: "Utilisateurs", path: "/admin/users" },
          { icon: Shield, label: "Audit Système", path: "/admin/audit" },
        ]
      });
    }

    if (role === "greffier") {
      sections.push({
        title: "Gestion Administrative",
        items: [
          { icon: Calendar, label: "Audiences", path: "/dashboard/audiences" },
          { icon: Building2, label: "Gestion Salles", path: "/greffier/gestion-salles" },
          { icon: FolderOpen, label: "Dossiers", path: "/dashboard/dossiers" },
          { icon: Users, label: "Utilisateurs", path: "/greffier/users" },
        ]
      });
      sections.push({
        title: "Traitement Judiciaire",
        items: [
          { icon: Gavel, label: "Validation Décisions", path: "/greffier/validation-decisions" },
          { icon: MessageSquare, label: "Instructions Juges", path: "/greffier/instructions" },
        ]
      });
      sections.push({
        title: "Communication",
        items: [
          { icon: Bell, label: "Envoi Notifications", path: "/greffier/envoi-notifications" },
          { icon: Monitor, label: "Tableau Affichage", path: "/greffier/affichage" },
        ]
      });
      sections.push({
        title: "Rapports",
        items: [
          { icon: BarChart3, label: "Statistiques", path: "/greffier/stats" },
        ]
      });
    }

    if (role === "juge") {
      sections.push({
        title: "Mes Affaires",
        items: [
          { icon: Calendar, label: "Audiences", path: "/dashboard/audiences" },
          { icon: FolderOpen, label: "Dossiers", path: "/dashboard/dossiers" },
        ]
      });
      sections.push({
        title: "Décisions",
        items: [
          { icon: PenTool, label: "Rédiger Décision", path: "/juge/decisions" },
          { icon: History, label: "Historique", path: "/juge/historique-decisions" },
        ]
      });
      sections.push({
        title: "Communication",
        items: [
          { icon: MessageSquare, label: "Instructions Greffe", path: "/juge/instructions" },
        ]
      });
      sections.push({
        title: "Rapports",
        items: [
          { icon: BarChart3, label: "Mes Statistiques", path: "/juge/stats" },
        ]
      });
    }

    if (role === "procureur") {
      sections.push({
        title: "Ministère Public",
        items: [
          { icon: Briefcase, label: "Affaires Parquet", path: "/procureur/affaires" },
          { icon: Calendar, label: "Audiences", path: "/dashboard/audiences" },
          { icon: FolderOpen, label: "Dossiers", path: "/dashboard/dossiers" },
        ]
      });
      sections.push({
        title: "Décisions",
        items: [
          { icon: Gavel, label: "Décisions Justice", path: "/procureur/decisions" },
        ]
      });
      sections.push({
        title: "Rapports",
        items: [
          { icon: BarChart3, label: "Statistiques", path: "/procureur/stats" },
        ]
      });
    }

    if (role === "avocat") {
      sections.push({
        title: "Gestion Clients",
        items: [
          { icon: Briefcase, label: "Mes Affaires", path: "/avocat/affaires" },
          { icon: Calendar, label: "Audiences", path: "/dashboard/audiences" },
          { icon: FolderOpen, label: "Dossiers", path: "/dashboard/dossiers" },
        ]
      });
      sections.push({
        title: "Documents",
        items: [
          { icon: FileText, label: "Pièces & Conclusions", path: "/avocat/documents" },
          { icon: Gavel, label: "Décisions Clients", path: "/avocat/decisions-clients" },
        ]
      });
    }

    if (role === "justiciable") {
      sections.push({
        title: "Mon Dossier",
        items: [
          { icon: FolderOpen, label: "Suivi Dossier", path: "/justiciable/mon-dossier" },
          { icon: Calendar, label: "Mes Audiences", path: "/dashboard/audiences" },
        ]
      });
      sections.push({
        title: "Informations",
        items: [
          { icon: Gavel, label: "Décisions", path: "/justiciable/decisions" },
          { icon: Monitor, label: "Tableau Affichage", path: "/justiciable/tableau-affichage" },
        ]
      });
    }

    // Section commune - Notifications (pour tous sauf peut-être ajustements)
    sections.push({
      title: "Notifications",
      items: [
        { icon: Bell, label: "Mes Notifications", path: "/dashboard/notifications" },
      ]
    });

    // Affichage public - accessible à tous
    sections.push({
      title: "Accès Public",
      items: [
        { icon: Monitor, label: "Affichage Public", path: "/public-display" },
      ]
    });

    return sections;
  };

  const menuSections = getMenuSections();

  const isActive = (path: string) => location.pathname === path;

  const getRoleLabel = (role: string) => {
    const roles: Record<string, string> = {
      admin: "Administrateur",
      greffier: "Greffier",
      juge: "Juge",
      procureur: "Procureur",
      avocat: "Avocat",
      justiciable: "Justiciable"
    };
    return roles[role] || role;
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: "bg-red-500/20 text-red-200",
      greffier: "bg-blue-500/20 text-blue-200",
      juge: "bg-purple-500/20 text-purple-200",
      procureur: "bg-orange-500/20 text-orange-200",
      avocat: "bg-green-500/20 text-green-200",
      justiciable: "bg-cyan-500/20 text-cyan-200"
    };
    return colors[role] || "bg-gray-500/20 text-gray-200";
  };

  return (
    <div className="min-h-screen bg-background flex w-full">
      {/* Overlay pour mobile */}
      {sidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ 
          x: sidebarOpen ? 0 : -280,
          width: 280 
        }}
        className="gradient-hero text-primary-foreground shadow-elegant fixed lg:relative z-50 h-screen lg:z-10 lg:translate-x-0 flex flex-col"
        style={{ width: sidebarOpen ? 280 : 0 }}
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-white/10">
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3"
            >
              <div className="p-2 bg-accent/20 rounded-lg">
                <Scale className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h2 className="font-bold text-lg">e-Justice</h2>
                <p className="text-xs opacity-75">Sénégal</p>
              </div>
            </motion.div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hover:bg-white/10"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* User Info */}
        {sidebarOpen && currentUser && (
          <div className="p-4 border-b border-white/10">
            <div 
              className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-all"
              onClick={() => navigate("/dashboard/profile")}
            >
              <Avatar className="w-10 h-10 ring-2 ring-accent/30">
                <AvatarImage src={currentUser.photo} alt={currentUser.nom} />
                <AvatarFallback className="bg-accent text-accent-foreground font-bold text-sm">
                  {currentUser.prenom[0]}{currentUser.nom[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {currentUser.prenom} {currentUser.nom}
                </p>
                <Badge className={cn("text-xs mt-1", getRoleColor(currentUser.role))}>
                  {getRoleLabel(currentUser.role)}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-4">
          {menuSections.map((section, sectionIndex) => (
            <div key={section.title}>
              {sectionIndex > 0 && <Separator className="bg-white/10 mb-3" />}
              {sidebarOpen && (
                <p className="text-xs uppercase tracking-wider text-white/50 font-medium px-3 mb-2">
                  {section.title}
                </p>
              )}
              <div className="space-y-1">
                {section.items.map((item) => (
                  <motion.div
                    key={item.path}
                    whileHover={{ x: 3 }}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer relative",
                      isActive(item.path)
                        ? "bg-accent text-accent-foreground shadow-gold"
                        : "hover:bg-white/10"
                    )}
                    onClick={() => navigate(item.path)}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {sidebarOpen && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="font-medium text-sm flex-1"
                      >
                        {item.label}
                      </motion.span>
                    )}
                    {item.label === "Mes Notifications" && unreadNotifications > 0 && (
                      <Badge className="bg-destructive hover:bg-destructive text-white px-2 py-0 text-xs">
                        {unreadNotifications}
                      </Badge>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 space-y-1 border-t border-white/10">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start hover:bg-white/10 h-10"
            onClick={() => navigate("/dashboard/settings")}
          >
            <Settings className="w-5 h-5 mr-3" />
            {sidebarOpen && "Paramètres"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start hover:bg-white/10 text-red-300 hover:text-red-200 h-10"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5 mr-3" />
            {sidebarOpen && "Déconnexion"}
          </Button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 w-full">
        {/* Top Bar */}
        <header className="bg-card border-b border-border p-3 md:p-4 shadow-sm sticky top-0 z-30">
          <div className="flex items-center justify-between gap-2">
            {/* Menu hamburger pour mobile */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden hover:bg-primary/10"
            >
              <Menu className="w-5 h-5" />
            </Button>
            
            <div className="flex-1 min-w-0">
              <h1 className="text-lg md:text-2xl font-bold truncate">Tableau de bord</h1>
              <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">
                Bienvenue sur votre espace de gestion
              </p>
            </div>
            <div className="flex items-center gap-2 md:gap-4 cursor-pointer hover:opacity-80 transition-smooth" onClick={() => navigate("/dashboard/profile")}>
              <div className="text-right hidden md:block">
                <p className="font-medium text-sm md:text-base">
                  {currentUser ? `${currentUser.prenom} ${currentUser.nom}` : "Utilisateur"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {currentUser ? getRoleLabel(currentUser.role) : "Invité"}
                </p>
              </div>
              <Avatar className="w-8 h-8 md:w-10 md:h-10 ring-2 ring-primary/20">
                <AvatarImage src={currentUser?.photo} alt={currentUser?.nom} />
                <AvatarFallback className="bg-accent text-accent-foreground font-bold">
                  {currentUser ? `${currentUser.prenom[0]}${currentUser.nom[0]}` : "?"}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-3 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
