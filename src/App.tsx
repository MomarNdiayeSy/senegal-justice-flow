import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./contexts/AppContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import PublicDisplay from "./pages/PublicDisplay";
import AudienceDetails from "./pages/AudienceDetails";
import Blog from "./pages/Blog";
import NotFound from "./pages/NotFound";

// Admin pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminAudit from "./pages/admin/Audit";
import AdminStats from "./pages/admin/Stats";

// Greffier pages
import GreffierDashboard from "./pages/greffier/Dashboard";
import GreffierUsers from "./pages/greffier/Users";
import GreffierValidationDecisions from "./pages/greffier/ValidationDecisions";
import GreffierInstructions from "./pages/greffier/InstructionsGreffe";
import GreffierStats from "./pages/greffier/Stats";
import GreffierAffichage from "./pages/greffier/Affichage";
import GreffierEnvoiNotifications from "./pages/greffier/EnvoiNotifications";

// Juge pages
import JugeDashboard from "./pages/juge/Dashboard";
import JugeDecisions from "./pages/juge/Decisions";
import JugeDecisionHistory from "./pages/juge/DecisionHistory";
import JugeInstructions from "./pages/juge/Instructions";
import JugeStats from "./pages/juge/Stats";

// Procureur pages
import ProcureurDashboard from "./pages/procureur/Dashboard";
import ProcureurAffaires from "./pages/procureur/Affaires";
import ProcureurDecisions from "./pages/procureur/Decisions";
import ProcureurStats from "./pages/procureur/Stats";

// Avocat pages
import AvocatDashboard from "./pages/avocat/Dashboard";
import AvocatAffaires from "./pages/avocat/Affaires";
import AvocatDocuments from "./pages/avocat/Documents";
import AvocatDecisionsClients from "./pages/avocat/DecisionsClients";

// Justiciable pages
import JusticiableDashboard from "./pages/justiciable/Dashboard";
import JusticiableMonDossier from "./pages/justiciable/MonDossier";
import JusticiableDecisions from "./pages/justiciable/Decisions";
import JusticiableTableauAffichage from "./pages/justiciable/TableauAffichage";

// Common pages
import CommonAudiences from "./pages/common/Audiences";
import CommonDossiers from "./pages/common/Dossiers";
import CommonNotifications from "./pages/common/Notifications";
import CommonNotificationPreferences from "./pages/common/NotificationPreferences";
import CommonProfile from "./pages/common/Profile";
import CommonSettings from "./pages/common/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AppProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/public-display" element={<PublicDisplay />} />
            <Route path="/audience-details" element={<AudienceDetails />} />
            
            {/* Route principale dashboard (redirige selon le rôle) */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />

            {/* Routes Admin */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminUsers />
              </ProtectedRoute>
            } />
            <Route path="/admin/audit" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminAudit />
              </ProtectedRoute>
            } />
            <Route path="/admin/stats" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminStats />
              </ProtectedRoute>
            } />

            {/* Routes Greffier */}
            <Route path="/greffier/dashboard" element={
              <ProtectedRoute allowedRoles={["greffier"]}>
                <GreffierDashboard />
              </ProtectedRoute>
            } />
            <Route path="/greffier/users" element={
              <ProtectedRoute allowedRoles={["greffier"]}>
                <GreffierUsers />
              </ProtectedRoute>
            } />
            <Route path="/greffier/validation-decisions" element={
              <ProtectedRoute allowedRoles={["greffier"]}>
                <GreffierValidationDecisions />
              </ProtectedRoute>
            } />
            <Route path="/greffier/instructions" element={
              <ProtectedRoute allowedRoles={["greffier"]}>
                <GreffierInstructions />
              </ProtectedRoute>
            } />
            <Route path="/greffier/stats" element={
              <ProtectedRoute allowedRoles={["greffier"]}>
                <GreffierStats />
              </ProtectedRoute>
            } />
            <Route path="/greffier/affichage" element={
              <ProtectedRoute allowedRoles={["greffier"]}>
                <GreffierAffichage />
              </ProtectedRoute>
            } />
            <Route path="/greffier/envoi-notifications" element={
              <ProtectedRoute allowedRoles={["greffier"]}>
                <GreffierEnvoiNotifications />
              </ProtectedRoute>
            } />

            {/* Routes Juge */}
            <Route path="/juge/dashboard" element={
              <ProtectedRoute allowedRoles={["juge"]}>
                <JugeDashboard />
              </ProtectedRoute>
            } />
            <Route path="/juge/decisions" element={
              <ProtectedRoute allowedRoles={["juge"]}>
                <JugeDecisions />
              </ProtectedRoute>
            } />
            <Route path="/juge/historique-decisions" element={
              <ProtectedRoute allowedRoles={["juge"]}>
                <JugeDecisionHistory />
              </ProtectedRoute>
            } />
            <Route path="/juge/instructions" element={
              <ProtectedRoute allowedRoles={["juge"]}>
                <JugeInstructions />
              </ProtectedRoute>
            } />
            <Route path="/juge/stats" element={
              <ProtectedRoute allowedRoles={["juge"]}>
                <JugeStats />
              </ProtectedRoute>
            } />

            {/* Routes Procureur */}
            <Route path="/procureur/dashboard" element={
              <ProtectedRoute allowedRoles={["procureur"]}>
                <ProcureurDashboard />
              </ProtectedRoute>
            } />
            <Route path="/procureur/affaires" element={
              <ProtectedRoute allowedRoles={["procureur"]}>
                <ProcureurAffaires />
              </ProtectedRoute>
            } />
            <Route path="/procureur/decisions" element={
              <ProtectedRoute allowedRoles={["procureur"]}>
                <ProcureurDecisions />
              </ProtectedRoute>
            } />
            <Route path="/procureur/stats" element={
              <ProtectedRoute allowedRoles={["procureur"]}>
                <ProcureurStats />
              </ProtectedRoute>
            } />

            {/* Routes Avocat */}
            <Route path="/avocat/dashboard" element={
              <ProtectedRoute allowedRoles={["avocat"]}>
                <AvocatDashboard />
              </ProtectedRoute>
            } />
            <Route path="/avocat/affaires" element={
              <ProtectedRoute allowedRoles={["avocat"]}>
                <AvocatAffaires />
              </ProtectedRoute>
            } />
            <Route path="/avocat/documents" element={
              <ProtectedRoute allowedRoles={["avocat"]}>
                <AvocatDocuments />
              </ProtectedRoute>
            } />
            <Route path="/avocat/decisions-clients" element={
              <ProtectedRoute allowedRoles={["avocat"]}>
                <AvocatDecisionsClients />
              </ProtectedRoute>
            } />

            {/* Routes Justiciable */}
            <Route path="/justiciable/dashboard" element={
              <ProtectedRoute allowedRoles={["justiciable"]}>
                <JusticiableDashboard />
              </ProtectedRoute>
            } />
            <Route path="/justiciable/mon-dossier" element={
              <ProtectedRoute allowedRoles={["justiciable"]}>
                <JusticiableMonDossier />
              </ProtectedRoute>
            } />
            <Route path="/justiciable/decisions" element={
              <ProtectedRoute allowedRoles={["justiciable"]}>
                <JusticiableDecisions />
              </ProtectedRoute>
            } />
            <Route path="/justiciable/tableau-affichage" element={
              <ProtectedRoute allowedRoles={["justiciable"]}>
                <JusticiableTableauAffichage />
              </ProtectedRoute>
            } />

            {/* Routes communes */}
            <Route path="/dashboard/audiences" element={
              <ProtectedRoute>
                <CommonAudiences />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/dossiers" element={
              <ProtectedRoute>
                <CommonDossiers />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/notifications" element={
              <ProtectedRoute>
                <CommonNotifications />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/notification-preferences" element={
              <ProtectedRoute>
                <CommonNotificationPreferences />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/profile" element={
              <ProtectedRoute>
                <CommonProfile />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/settings" element={
              <ProtectedRoute>
                <CommonSettings />
              </ProtectedRoute>
            } />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AppProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
