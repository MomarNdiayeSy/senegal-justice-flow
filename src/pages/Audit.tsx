import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Search, Download, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/DashboardLayout";
import { useApp } from "@/contexts/AppContext";

const Audit = () => {
  const { logs, users } = useApp();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredLogs = logs.filter(log =>
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getActionColor = (action: string) => {
    if (action.includes("Création")) return "bg-green-500";
    if (action.includes("Modification")) return "bg-blue-500";
    if (action.includes("Suppression")) return "bg-red-500";
    if (action.includes("Connexion")) return "bg-purple-500";
    return "bg-gray-500";
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? `${user.prenom} ${user.nom}` : "Système";
  };

  const exportLogs = () => {
    const csv = [
      ["Date", "Utilisateur", "Action", "Détails", "IP"],
      ...filteredLogs.map(log => [
        new Date(log.date).toLocaleString("fr-FR"),
        getUserName(log.userId),
        log.action,
        log.details,
        log.ipAddress
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit_logs_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Card className="shadow-md border-0">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8 text-accent" />
                <CardTitle className="text-2xl">Journal d'audit</CardTitle>
              </div>
              <Button variant="outline" onClick={exportLogs}>
                <Download className="w-4 h-4 mr-2" />
                Exporter CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Rechercher dans les logs..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-3">
              {filteredLogs.length === 0 ? (
                <div className="text-center py-12">
                  <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg text-muted-foreground">
                    Aucun log trouvé
                  </p>
                </div>
              ) : (
                filteredLogs.map((log, index) => (
                  <motion.div
                    key={log.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.02 }}
                  >
                    <Card className="hover:shadow-sm transition-smooth">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <Badge className={`${getActionColor(log.action)} text-white shrink-0`}>
                            {log.action}
                          </Badge>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{log.details}</p>
                            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                              <span>{getUserName(log.userId)}</span>
                              <span>•</span>
                              <span>
                                {new Date(log.date).toLocaleString("fr-FR", {
                                  day: "2-digit",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit"
                                })}
                              </span>
                              <span>•</span>
                              <span>{log.ipAddress}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Security Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="gradient-card border-0 shadow-md">
            <CardContent className="p-6">
              <h3 className="text-sm text-muted-foreground mb-1">Total logs</h3>
              <p className="text-3xl font-bold">{logs.length}</p>
            </CardContent>
          </Card>
          <Card className="gradient-card border-0 shadow-md">
            <CardContent className="p-6">
              <h3 className="text-sm text-muted-foreground mb-1">Aujourd'hui</h3>
              <p className="text-3xl font-bold">
                {logs.filter(l => new Date(l.date).toDateString() === new Date().toDateString()).length}
              </p>
            </CardContent>
          </Card>
          <Card className="gradient-card border-0 shadow-md">
            <CardContent className="p-6">
              <h3 className="text-sm text-muted-foreground mb-1">Connexions</h3>
              <p className="text-3xl font-bold">
                {logs.filter(l => l.action === "Connexion").length}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Audit;
