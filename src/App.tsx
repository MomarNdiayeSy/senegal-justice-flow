import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./contexts/AppContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Stats from "./pages/Stats";
import PublicDisplay from "./pages/PublicDisplay";
import Users from "./pages/Users";
import Dossiers from "./pages/Dossiers";
import Notifications from "./pages/Notifications";
import Audit from "./pages/Audit";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/stats" element={<Stats />} />
            <Route path="/dashboard/users" element={<Users />} />
            <Route path="/dashboard/dossiers" element={<Dossiers />} />
            <Route path="/dashboard/notifications" element={<Notifications />} />
            <Route path="/dashboard/audit" element={<Audit />} />
            <Route path="/dashboard/settings" element={<Settings />} />
            <Route path="/public-display" element={<PublicDisplay />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AppProvider>
  </QueryClientProvider>
);

export default App;
