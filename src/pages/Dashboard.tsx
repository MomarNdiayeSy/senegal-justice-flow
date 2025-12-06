import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";

const Dashboard = () => {
  const { currentUser } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate("/auth");
      return;
    }

    // Rediriger vers le dashboard spécifique au rôle
    switch (currentUser.role) {
      case "admin":
        navigate("/admin/dashboard");
        break;
      case "greffier":
        navigate("/greffier/dashboard");
        break;
      case "juge":
        navigate("/juge/dashboard");
        break;
      case "procureur":
        navigate("/procureur/dashboard");
        break;
      case "avocat":
        navigate("/avocat/dashboard");
        break;
      case "justiciable":
        navigate("/justiciable/dashboard");
        break;
      case "citizen":
        navigate("/citizen/dashboard");
        break;
      default:
        navigate("/greffier/dashboard");
    }
  }, [currentUser, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
};

export default Dashboard;
