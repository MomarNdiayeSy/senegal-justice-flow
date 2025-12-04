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
  CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useApp } from "@/contexts/AppContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
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

  // Menu dynamique selon le rôle
  const getMenuItems = () => {
    if (!currentUser) return [];

    const roleBasePath = `/${currentUser.role}/dashboard`;
    
    const baseItems = [
      { icon: Calendar, label: "Tableau de bord", path: roleBasePath, roles: ["admin", "greffier", "juge", "procureur", "avocat", "justiciable"] },
      { icon: Calendar, label: "Audiences", path: "/dashboard/audiences", roles: ["admin", "greffier", "juge", "procureur", "avocat", "justiciable"] },
      { icon: FileText, label: "Dossiers", path: "/dashboard/dossiers", roles: ["admin", "greffier", "juge", "procureur", "avocat"] },
      // Menu spécifique Greffier
      { icon: Users, label: "Utilisateurs", path: "/greffier/users", roles: ["greffier"] },
      { icon: Scale, label: "Validation Décisions", path: "/greffier/validation-decisions", roles: ["greffier"] },
      { icon: MessageSquare, label: "Instructions Juges", path: "/greffier/instructions", roles: ["greffier"] },
      { icon: Monitor, label: "Tableau Affichage", path: "/greffier/affichage", roles: ["greffier"] },
      { icon: BarChart3, label: "Rapports", path: "/greffier/stats", roles: ["greffier"] },
      // Menu spécifique Juge
      { icon: PenTool, label: "Mes Décisions", path: "/juge/decisions", roles: ["juge"] },
      { icon: History, label: "Historique Décisions", path: "/juge/historique-decisions", roles: ["juge"] },
      { icon: MessageSquare, label: "Instructions Greffe", path: "/juge/instructions", roles: ["juge"] },
      { icon: BarChart3, label: "Mes Statistiques", path: "/juge/stats", roles: ["juge"] },
      // Menu spécifique Procureur
      { icon: FileText, label: "Affaires Parquet", path: "/procureur/affaires", roles: ["procureur"] },
      { icon: Scale, label: "Décisions Justice", path: "/procureur/decisions", roles: ["procureur"] },
      { icon: BarChart3, label: "Rapports", path: "/procureur/stats", roles: ["procureur"] },
      // Notifications
      { icon: Bell, label: "Notifications", path: "/dashboard/notifications", roles: ["admin", "greffier", "juge", "procureur", "avocat", "justiciable"] },
      // Admin only
      { icon: BarChart3, label: "Statistiques", path: "/admin/stats", roles: ["admin"] },
      { icon: Users, label: "Utilisateurs", path: "/admin/users", roles: ["admin"] },
      { icon: Shield, label: "Audit", path: "/admin/audit", roles: ["admin"] },
      { icon: Monitor, label: "Affichage public", path: "/public-display", roles: ["admin", "greffier", "juge", "procureur", "avocat", "justiciable"] },
    ];

    // Filtrer les éléments du menu selon le rôle de l'utilisateur
    return baseItems.filter(item => 
      item.roles.includes(currentUser.role)
    );
  };

  const menuItems = getMenuItems();

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
        className="gradient-hero text-primary-foreground shadow-elegant fixed lg:relative z-50 h-screen lg:z-10 lg:translate-x-0"
        style={{ width: sidebarOpen ? 280 : 0 }}
      >
        <div className="p-6 flex items-center justify-between border-b border-white/10">
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3"
            >
              <Scale className="w-8 h-8 text-accent" />
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

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <motion.div
              key={item.path}
              whileHover={{ x: 5 }}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg transition-smooth cursor-pointer relative",
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
                  className="font-medium flex-1"
                >
                  {item.label}
                </motion.span>
              )}
              {item.label === "Notifications" && unreadNotifications > 0 && (
                <Badge className="bg-destructive hover:bg-destructive text-white px-2 py-0 text-xs">
                  {unreadNotifications}
                </Badge>
              )}
            </motion.div>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2 border-t border-white/10">
          <Button
            variant="ghost"
            className="w-full justify-start hover:bg-white/10"
            onClick={() => navigate("/dashboard/settings")}
          >
            <Settings className="w-5 h-5 mr-3" />
            {sidebarOpen && "Paramètres"}
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start hover:bg-white/10 text-red-300 hover:text-red-200"
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
