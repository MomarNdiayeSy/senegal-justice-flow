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
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useApp } from "@/contexts/AppContext";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, notifications } = useApp();
  
  const unreadNotifications = notifications.filter(
    n => !n.lue && (!currentUser || n.destinataireId === currentUser.id)
  ).length;

  const menuItems = [
    { icon: Calendar, label: "Audiences", path: "/dashboard" },
    { icon: FileText, label: "Dossiers", path: "/dashboard/dossiers" },
    { icon: Bell, label: "Notifications", path: "/dashboard/notifications" },
    { icon: BarChart3, label: "Statistiques", path: "/dashboard/stats" },
    { icon: Users, label: "Utilisateurs", path: "/dashboard/users" },
    { icon: Shield, label: "Audit", path: "/dashboard/audit" },
    { icon: Monitor, label: "Affichage public", path: "/public-display" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background flex w-full">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 80 }}
        className="gradient-hero text-primary-foreground shadow-elegant relative z-10"
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
            onClick={() => navigate("/")}
          >
            <LogOut className="w-5 h-5 mr-3" />
            {sidebarOpen && "Déconnexion"}
          </Button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-card border-b border-border p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Tableau de bord</h1>
              <p className="text-sm text-muted-foreground">
                Bienvenue sur votre espace de gestion
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-medium">
                  {currentUser ? `${currentUser.prenom} ${currentUser.nom}` : "Utilisateur"}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {currentUser?.role || "Invité"}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-bold">
                {currentUser ? `${currentUser.prenom[0]}${currentUser.nom[0]}` : "?"}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
