import { Navigate } from "react-router-dom";
import { useApp, UserRole } from "@/contexts/AppContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { currentUser } = useApp();

  // Si pas d'utilisateur connecté, rediriger vers l'authentification
  if (!currentUser) {
    return <Navigate to="/auth" replace />;
  }

  // Si des rôles spécifiques sont requis, vérifier
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
