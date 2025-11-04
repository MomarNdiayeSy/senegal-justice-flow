import { motion } from "framer-motion";
import { Users, Calendar, Shield, Activity, AlertTriangle, TrendingUp, Settings, BarChart3, Building2, UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/contexts/AppContext";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const { users, audiences, logs } = useApp();
  const navigate = useNavigate();

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
        <div className="flex gap-2">
          <Button className="shadow-gold hover:scale-105 transition-smooth" onClick={() => navigate('/users')}>
            <UserPlus className="w-4 h-4 mr-2" />
            Gérer les utilisateurs
          </Button>
          <Button variant="outline" className="hover:scale-105 transition-smooth" onClick={() => navigate('/settings')}>
            <Settings className="w-4 h-4 mr-2" />
            Paramètres
          </Button>
        </div>
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

      {/* Gestion Multi-Tribunaux */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Gestion Multi-Tribunaux
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg border bg-card hover:shadow-md transition-smooth cursor-pointer">
                <h3 className="font-bold text-lg mb-2">Tribunal de Dakar</h3>
                <p className="text-sm text-muted-foreground mb-3">12 audiences aujourd'hui</p>
                <div className="flex gap-2">
                  <Badge className="bg-green-100 text-green-700">Opérationnel</Badge>
                </div>
              </div>
              <div className="p-4 rounded-lg border bg-card hover:shadow-md transition-smooth cursor-pointer">
                <h3 className="font-bold text-lg mb-2">Tribunal de Thiès</h3>
                <p className="text-sm text-muted-foreground mb-3">8 audiences aujourd'hui</p>
                <div className="flex gap-2">
                  <Badge className="bg-green-100 text-green-700">Opérationnel</Badge>
                </div>
              </div>
              <div className="p-4 rounded-lg border bg-card hover:shadow-md transition-smooth cursor-pointer">
                <h3 className="font-bold text-lg mb-2">Tribunal de Saint-Louis</h3>
                <p className="text-sm text-muted-foreground mb-3">5 audiences aujourd'hui</p>
                <div className="flex gap-2">
                  <Badge className="bg-green-100 text-green-700">Opérationnel</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Rapports et Analytics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Rapports et Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" className="h-auto py-6 flex-col gap-2" onClick={() => navigate('/stats')}>
                <BarChart3 className="w-8 h-8 text-primary" />
                <span className="font-semibold">Statistiques générales</span>
                <span className="text-xs text-muted-foreground">Vue d'ensemble du système</span>
              </Button>
              <Button variant="outline" className="h-auto py-6 flex-col gap-2" onClick={() => navigate('/audit')}>
                <Shield className="w-8 h-8 text-primary" />
                <span className="font-semibold">Logs de sécurité</span>
                <span className="text-xs text-muted-foreground">Audit et traçabilité</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Activité récente */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
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
