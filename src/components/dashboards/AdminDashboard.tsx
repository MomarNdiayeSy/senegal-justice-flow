import { motion } from "framer-motion";
import { Users, Calendar, Shield, Activity, AlertTriangle, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useApp } from "@/contexts/AppContext";

const AdminDashboard = () => {
  const { users, audiences, logs } = useApp();

  const stats = [
    {
      title: "Total Utilisateurs",
      value: users.length,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Audiences en cours",
      value: audiences.filter(a => a.statut === "en_cours").length,
      icon: Calendar,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Incidents techniques",
      value: 0,
      icon: AlertTriangle,
      color: "text-amber-600",
      bgColor: "bg-amber-50"
    },
    {
      title: "Logs de sécurité",
      value: logs.length,
      icon: Shield,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    }
  ];

  const usersByRole = {
    admin: users.filter(u => u.role === "admin").length,
    greffier: users.filter(u => u.role === "greffier").length,
    juge: users.filter(u => u.role === "juge").length,
    procureur: users.filter(u => u.role === "procureur").length,
    avocat: users.filter(u => u.role === "avocat").length,
    justiciable: users.filter(u => u.role === "justiciable").length
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-primary">Administration Générale</h1>
          <p className="text-muted-foreground mt-1">Gestion et supervision du système e-Justice</p>
        </div>
        <Shield className="w-12 h-12 text-primary" />
      </motion.div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="shadow-elegant hover:shadow-gold transition-smooth cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="flex items-center text-xs text-green-600 mt-2">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Système opérationnel
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Répartition des utilisateurs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Répartition des utilisateurs par rôle
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(usersByRole).map(([role, count], index) => (
              <div key={role} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium capitalize">{role}</span>
                  <span className="text-muted-foreground">{count} utilisateur{count > 1 ? 's' : ''}</span>
                </div>
                <Progress value={(count / users.length) * 100} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Activité récente */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Activité récente du système
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {logs.slice(0, 5).map((log) => {
                const user = users.find(u => u.id === log.userId);
                return (
                  <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{log.action}</p>
                      <p className="text-xs text-muted-foreground">{log.details}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {user?.prenom} {user?.nom} • {new Date(log.date).toLocaleString('fr-FR')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
