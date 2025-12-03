import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Calendar, Clock, CheckCircle, AlertTriangle, Scale, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useApp } from "@/contexts/AppContext";
import DashboardLayout from "@/components/DashboardLayout";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";

const JugeStats = () => {
  const { audiences, dossiers, currentUser } = useApp();

  const mesAudiences = audiences.filter(a => a.jugeId === currentUser?.id);
  const audiencesTerminees = mesAudiences.filter(a => a.statut === "terminee");
  const audiencesReportees = mesAudiences.filter(a => a.statut === "reportee");
  const audiencesPrevues = mesAudiences.filter(a => a.statut === "prevue");
  const audiencesEnCours = mesAudiences.filter(a => a.statut === "en_cours");

  // Calcul des statistiques
  const tauxTraitement = mesAudiences.length > 0 
    ? Math.round((audiencesTerminees.length / mesAudiences.length) * 100) 
    : 0;
  
  const tauxReport = mesAudiences.length > 0 
    ? Math.round((audiencesReportees.length / mesAudiences.length) * 100) 
    : 0;

  // Délai moyen (simulation)
  const delaiMoyen = 45; // jours

  // Données pour les graphiques
  const monthlyData = [
    { mois: "Jan", traitees: 12, reportees: 2 },
    { mois: "Fév", traitees: 15, reportees: 1 },
    { mois: "Mar", traitees: 18, reportees: 3 },
    { mois: "Avr", traitees: 14, reportees: 2 },
    { mois: "Mai", traitees: 20, reportees: 1 },
    { mois: "Juin", traitees: 16, reportees: 2 }
  ];

  const statutData = [
    { name: "Terminées", value: audiencesTerminees.length, color: "#22c55e" },
    { name: "En cours", value: audiencesEnCours.length, color: "#f59e0b" },
    { name: "Prévues", value: audiencesPrevues.length, color: "#3b82f6" },
    { name: "Reportées", value: audiencesReportees.length, color: "#ef4444" }
  ];

  const matiereData = [
    { matiere: "Civil", affaires: 25 },
    { matiere: "Pénal", affaires: 18 },
    { matiere: "Commercial", affaires: 12 },
    { matiere: "Famille", affaires: 8 },
    { matiere: "Social", affaires: 5 }
  ];

  const performanceData = [
    { semaine: "S1", performances: 85 },
    { semaine: "S2", performances: 88 },
    { semaine: "S3", performances: 82 },
    { semaine: "S4", performances: 90 },
    { semaine: "S5", performances: 87 },
    { semaine: "S6", performances: 92 }
  ];

  const stats = [
    {
      title: "Affaires traitées",
      value: audiencesTerminees.length,
      subtitle: "ce mois",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Taux de traitement",
      value: `${tauxTraitement}%`,
      subtitle: "global",
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Taux de report",
      value: `${tauxReport}%`,
      subtitle: "à surveiller",
      icon: AlertTriangle,
      color: tauxReport > 20 ? "text-red-600" : "text-amber-600",
      bgColor: tauxReport > 20 ? "bg-red-50" : "bg-amber-50"
    },
    {
      title: "Délai moyen",
      value: `${delaiMoyen}j`,
      subtitle: "par affaire",
      icon: Clock,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-primary">Mes Statistiques</h1>
            <p className="text-muted-foreground mt-1">Suivi de performance et indicateurs d'activité</p>
          </div>
          <BarChart3 className="w-10 h-10 text-primary" />
        </motion.div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="shadow-elegant hover:shadow-gold transition-smooth">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl md:text-3xl font-bold mt-1">{stat.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
                    </div>
                    <div className={`p-2 md:p-3 rounded-full ${stat.bgColor}`}>
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Graphiques Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Évolution mensuelle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Évolution mensuelle
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mois" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="traitees" name="Traitées" fill="#22c55e" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="reportees" name="Reportées" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Répartition par statut */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="w-5 h-5 text-primary" />
                  Répartition des audiences
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statutData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {statutData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Graphiques Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Affaires par matière */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Affaires par matière
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={matiereData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="matiere" type="category" width={80} />
                      <Tooltip />
                      <Bar dataKey="affaires" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Courbe de performance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Indice de performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="semaine" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="performances" 
                        stroke="#8b5cf6" 
                        strokeWidth={2}
                        dot={{ fill: "#8b5cf6" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Indicateurs détaillés */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Indicateurs détaillés
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Taux de traitement des affaires</span>
                  <span className="text-sm text-muted-foreground">{tauxTraitement}%</span>
                </div>
                <Progress value={tauxTraitement} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Respect des délais légaux</span>
                  <span className="text-sm text-muted-foreground">78%</span>
                </div>
                <Progress value={78} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Taux de décisions rendues</span>
                  <span className="text-sm text-muted-foreground">92%</span>
                </div>
                <Progress value={92} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Satisfaction des parties</span>
                  <span className="text-sm text-muted-foreground">85%</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default JugeStats;
