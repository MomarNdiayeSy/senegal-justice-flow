import DashboardLayout from "@/components/DashboardLayout";
import { useApp } from "@/contexts/AppContext";
import AdminDashboard from "@/components/dashboards/AdminDashboard";
import GreffierDashboard from "@/components/dashboards/GreffierDashboard";
import JugeDashboard from "@/components/dashboards/JugeDashboard";
import ProcureurDashboard from "@/components/dashboards/ProcureurDashboard";
import AvocatDashboard from "@/components/dashboards/AvocatDashboard";
import JusticiableDashboard from "@/components/dashboards/JusticiableDashboard";

const Dashboard = () => {
  const { currentUser } = useApp();

  // Afficher le dashboard correspondant au rôle de l'utilisateur
  const renderDashboard = () => {
    if (!currentUser) {
      return <div className="text-center py-12">Veuillez vous connecter pour accéder au tableau de bord</div>;
    }

    switch (currentUser.role) {
      case "admin":
        return <AdminDashboard />;
      case "greffier":
        return <GreffierDashboard />;
      case "juge":
        return <JugeDashboard />;
      case "procureur":
        return <ProcureurDashboard />;
      case "avocat":
        return <AvocatDashboard />;
      case "justiciable":
        return <JusticiableDashboard />;
      default:
        return <GreffierDashboard />;
    }
  };

  return (
    <DashboardLayout>
      {renderDashboard()}
    </DashboardLayout>
  );
};

export default Dashboard;
