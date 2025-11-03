import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Search, Download, Filter, AlertTriangle, UserPlus, UserX, Edit, LogIn, Clock, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import DashboardLayout from "@/components/DashboardLayout";
import { useApp } from "@/contexts/AppContext";

const Audit = () => {
  const { logs, users } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [userFilter, setUserFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  // Detect suspicious activities
  const suspiciousLogs = logs.filter(log => {
    const recentFailedLogins = logs.filter(l => 
      l.action === "Connexion échouée" && 
      l.ipAddress === log.ipAddress &&
      Date.now() - new Date(l.date).getTime() < 3600000 // Last hour
    ).length;
    return recentFailedLogins >= 3 || log.action.includes("Suppression");
  });

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesUser = userFilter === "all" || log.userId === userFilter;
    
    const logDate = new Date(log.date);
    const now = new Date();
    let matchesDate = true;
    
    if (dateFilter === "today") {
      matchesDate = logDate.toDateString() === now.toDateString();
    } else if (dateFilter === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      matchesDate = logDate >= weekAgo;
    } else if (dateFilter === "month") {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      matchesDate = logDate >= monthAgo;
    }
    
    return matchesSearch && matchesUser && matchesDate;
  });

  const getActionIcon = (action: string) => {
    if (action.includes("Création") || action.includes("Ajout")) return UserPlus;
    if (action.includes("Modification")) return Edit;
    if (action.includes("Suppression")) return UserX;
    if (action.includes("Connexion")) return LogIn;
    return Shield;
  };

  const getActionColor = (action: string) => {
    if (action.includes("Création") || action.includes("Ajout")) return "bg-emerald-500 dark:bg-emerald-600";
    if (action.includes("Modification")) return "bg-blue-500 dark:bg-blue-600";
    if (action.includes("Suppression")) return "bg-red-500 dark:bg-red-600";
    if (action.includes("Connexion échouée")) return "bg-orange-500 dark:bg-orange-600";
    if (action.includes("Connexion")) return "bg-purple-500 dark:bg-purple-600";
    return "bg-muted";
  };

  const isCritical = (action: string) => {
    return action.includes("Suppression") || action.includes("échouée");
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
        {/* Security Alerts */}
        <AnimatePresence>
          {suspiciousLogs.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Alert variant="destructive" className="border-red-500 dark:border-red-600">
                <AlertTriangle className="h-5 w-5" />
                <AlertTitle className="font-bold">Activités suspectes détectées</AlertTitle>
                <AlertDescription>
                  {suspiciousLogs.length} activité(s) suspecte(s) identifiée(s). Vérifiez les logs marqués en rouge.
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        <Card className="shadow-md border-0 dark:bg-card/50">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
                >
                  <Shield className="w-8 h-8 text-accent" />
                </motion.div>
                <div>
                  <CardTitle className="text-2xl">Journal d'audit</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Surveillance et traçabilité des actions système
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowFilters(!showFilters)}
                  className="gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Filtres
                </Button>
                <Button variant="outline" onClick={exportLogs} className="gap-2">
                  <Download className="w-4 h-4" />
                  Exporter CSV
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher dans les logs..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Utilisateur
                        </label>
                        <Select value={userFilter} onValueChange={setUserFilter}>
                          <SelectTrigger>
                            <SelectValue placeholder="Tous les utilisateurs" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Tous les utilisateurs</SelectItem>
                            {users.map(user => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.prenom} {user.nom}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Période
                        </label>
                        <Select value={dateFilter} onValueChange={setDateFilter}>
                          <SelectTrigger>
                            <SelectValue placeholder="Toutes les dates" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Toutes les dates</SelectItem>
                            <SelectItem value="today">Aujourd'hui</SelectItem>
                            <SelectItem value="week">7 derniers jours</SelectItem>
                            <SelectItem value="month">30 derniers jours</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="mt-6 space-y-3 relative">
              {/* Timeline line */}
              <div className="absolute left-[29px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/20 via-primary/50 to-primary/20" />
              
              {filteredLogs.length === 0 ? (
                <div className="text-center py-12">
                  <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg text-muted-foreground">
                    Aucun log trouvé
                  </p>
                </div>
              ) : (
                filteredLogs.map((log, index) => {
                  const ActionIcon = getActionIcon(log.action);
                  const critical = isCritical(log.action);
                  const suspicious = suspiciousLogs.some(s => s.id === log.id);
                  
                  return (
                    <motion.div
                      key={log.id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.02 }}
                      className="relative"
                    >
                      <div className="flex items-start gap-4">
                        {/* Timeline icon */}
                        <motion.div
                          className={`shrink-0 w-[58px] h-[58px] rounded-full ${getActionColor(log.action)} flex items-center justify-center shadow-lg z-10 ${
                            suspicious ? "ring-4 ring-red-500 dark:ring-red-600" : ""
                          }`}
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <ActionIcon className="w-6 h-6 text-white" />
                        </motion.div>

                        {/* Log card */}
                        <Card className={`flex-1 hover:shadow-md transition-all ${
                          critical ? "border-red-500/50 dark:border-red-600/50 bg-red-50 dark:bg-red-950/20" : 
                          suspicious ? "border-orange-500/50 dark:border-orange-600/50 bg-orange-50 dark:bg-orange-950/20" :
                          "dark:bg-card/80"
                        }`}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge className={`${getActionColor(log.action)} text-white`}>
                                    {log.action}
                                  </Badge>
                                  {suspicious && (
                                    <Badge variant="destructive" className="gap-1">
                                      <AlertTriangle className="w-3 h-3" />
                                      Suspect
                                    </Badge>
                                  )}
                                </div>
                                <p className="font-medium text-foreground mb-2">{log.details}</p>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    {getUserName(log.userId)}
                                  </span>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {new Date(log.date).toLocaleString("fr-FR", {
                                      day: "2-digit",
                                      month: "short",
                                      hour: "2-digit",
                                      minute: "2-digit"
                                    })}
                                  </span>
                                  <span>•</span>
                                  <span className="font-mono text-xs">{log.ipAddress}</span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Security Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="gradient-card border-0 shadow-md dark:bg-card/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm text-muted-foreground mb-1">Total logs</h3>
                    <p className="text-3xl font-bold">{logs.length}</p>
                  </div>
                  <Shield className="w-8 h-8 text-primary opacity-20" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="gradient-card border-0 shadow-md dark:bg-card/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm text-muted-foreground mb-1">Aujourd'hui</h3>
                    <p className="text-3xl font-bold">
                      {logs.filter(l => new Date(l.date).toDateString() === new Date().toDateString()).length}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-blue-500 opacity-20" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="gradient-card border-0 shadow-md dark:bg-card/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm text-muted-foreground mb-1">Connexions</h3>
                    <p className="text-3xl font-bold">
                      {logs.filter(l => l.action === "Connexion").length}
                    </p>
                  </div>
                  <LogIn className="w-8 h-8 text-purple-500 opacity-20" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card className={`border-0 shadow-md ${
              suspiciousLogs.length > 0 
                ? "bg-red-500 dark:bg-red-600 text-white" 
                : "gradient-card dark:bg-card/50"
            }`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`text-sm mb-1 ${
                      suspiciousLogs.length > 0 ? "text-white/80" : "text-muted-foreground"
                    }`}>
                      Activités suspectes
                    </h3>
                    <p className="text-3xl font-bold">{suspiciousLogs.length}</p>
                  </div>
                  <motion.div
                    animate={suspiciousLogs.length > 0 ? { 
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1]
                    } : {}}
                    transition={{ duration: 0.5, repeat: suspiciousLogs.length > 0 ? Infinity : 0, repeatDelay: 2 }}
                  >
                    <AlertTriangle className={`w-8 h-8 ${
                      suspiciousLogs.length > 0 ? "text-white" : "text-orange-500 opacity-20"
                    }`} />
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Audit;
