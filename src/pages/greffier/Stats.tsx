import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Calendar, Clock, CheckCircle, AlertTriangle, FileText, Users, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/DashboardLayout";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area } from "recharts";
import { useState } from "react";

const GreffierStats = () => {
  const { audiences, dossiers, users } = useApp();
  const { toast } = useToast();
  const [periode, setPeriode] = useState("mois");

  const audiencesTerminees = audiences.filter(a => a.statut === "terminee");
  const audiencesReportees = audiences.filter(a => a.statut === "reportee");
  const audiencesPrevues = audiences.filter(a => a.statut === "prevue");
  const audiencesEnCours = audiences.filter(a => a.statut === "en_cours");

  const dossiersOuverts = dossiers.filter(d => d.statut === "ouvert" || d.statut === "en_cours");
  const dossiersClos = dossiers.filter(d => d.statut === "clos");
  const dossiersArchives = dossiers.filter(d => d.statut === "archive");

  // KPIs
  const tauxTraitement = audiences.length > 0 
    ? Math.round((audiencesTerminees.length / audiences.length) * 100) 
    : 0;
  
  const tauxReport = audiences.length > 0 
    ? Math.round((audiencesReportees.length / audiences.length) * 100) 
    : 0;

  const delaiMoyen = 32; // jours (simulation)

  // Données pour les graphiques
  const evolutionMensuelle = [
    { mois: "Jan", programmees: 45, terminees: 38, reportees: 5 },
    { mois: "Fév", programmees: 52, terminees: 48, reportees: 3 },
    { mois: "Mar", programmees: 48, terminees: 42, reportees: 4 },
    { mois: "Avr", programmees: 55, terminees: 50, reportees: 3 },
    { mois: "Mai", programmees: 60, terminees: 55, reportees: 4 },
    { mois: "Juin", programmees: 58, terminees: 52, reportees: 5 }
  ];

  const repartitionStatut = [
    { name: "Terminées", value: audiencesTerminees.length, color: "#22c55e" },
    { name: "En cours", value: audiencesEnCours.length, color: "#f59e0b" },
    { name: "Prévues", value: audiencesPrevues.length, color: "#3b82f6" },
    { name: "Reportées", value: audiencesReportees.length, color: "#ef4444" }
  ];

  const repartitionDossiers = [
    { name: "En cours", value: dossiersOuverts.length, color: "#3b82f6" },
    { name: "Clos", value: dossiersClos.length, color: "#22c55e" },
    { name: "Archivés", value: dossiersArchives.length, color: "#6b7280" }
  ];

  const performanceJuges = [
    { juge: "Juge Ba", affaires: 45, delaiMoyen: 28 },
    { juge: "Juge Diop", affaires: 38, delaiMoyen: 32 },
    { juge: "Juge Seck", affaires: 42, delaiMoyen: 30 },
    { juge: "Juge Fall", affaires: 35, delaiMoyen: 35 }
  ];

  const causesReports = [
    { cause: "Absence avocat", nombre: 12 },
    { cause: "Pièces manquantes", nombre: 8 },
    { cause: "Demande partie", nombre: 6 },
    { cause: "Indisponibilité juge", nombre: 4 },
    { cause: "Autre", nombre: 3 }
  ];

  const evolutionDossiers = [
    { mois: "Jan", nouveaux: 25, clos: 20 },
    { mois: "Fév", nouveaux: 30, clos: 28 },
    { mois: "Mar", nouveaux: 28, clos: 25 },
    { mois: "Avr", nouveaux: 35, clos: 30 },
    { mois: "Mai", nouveaux: 32, clos: 35 },
    { mois: "Juin", nouveaux: 28, clos: 30 }
  ];

  const handleExport = (format: "pdf" | "excel") => {
    toast({
      title: `Export ${format.toUpperCase()}`,
      description: "Le rapport a été généré et téléchargé"
    });
  };

  const stats = [
    {
      title: "Audiences programmées",
      value: audiences.length,
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Taux de traitement",
      value: `${tauxTraitement}%`,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Taux de report",
      value: `${tauxReport}%`,
      icon: AlertTriangle,
      color: tauxReport > 15 ? "text-red-600" : "text-amber-600",
      bgColor: tauxReport > 15 ? "bg-red-50" : "bg-amber-50"
    },
    {
      title: "Délai moyen",
      value: `${delaiMoyen}j`,
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
            <h1 className="text-2xl md:text-3xl font-bold text-primary">Rapports & Statistiques</h1>
            <p className="text-muted-foreground mt-1">Performance du tribunal et indicateurs clés</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={periode} onValueChange={setPeriode}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semaine">Cette semaine</SelectItem>
                <SelectItem value="mois">Ce mois</SelectItem>
                <SelectItem value="trimestre">Ce trimestre</SelectItem>
                <SelectItem value="annee">Cette année</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => handleExport("pdf")}>
              <Download className="w-4 h-4 mr-2" />
              PDF
            </Button>
            <Button variant="outline" onClick={() => handleExport("excel")}>
              <Download className="w-4 h-4 mr-2" />
              Excel
            </Button>
          </div>
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
              <Card className="shadow-elegant">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl md:text-3xl font-bold mt-1">{stat.value}</p>
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
                  Évolution des audiences
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={evolutionMensuelle}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mois" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="programmees" name="Programmées" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="terminees" name="Terminées" stackId="2" stroke="#22c55e" fill="#22c55e" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="reportees" name="Reportées" stackId="3" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                    </AreaChart>
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
                  <Calendar className="w-5 h-5 text-primary" />
                  Répartition des audiences
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={repartitionStatut}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {repartitionStatut.map((entry, index) => (
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
          {/* Causes des reports */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  Causes des reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={causesReports} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="cause" type="category" width={120} />
                      <Tooltip />
                      <Bar dataKey="nombre" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Performance par juge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Performance par magistrat
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={performanceJuges}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="juge" />
                      <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
                      <YAxis yAxisId="right" orientation="right" stroke="#22c55e" />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="affaires" name="Affaires traitées" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar yAxisId="right" dataKey="delaiMoyen" name="Délai moyen (j)" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Évolution dossiers et indicateurs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Évolution dossiers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Flux des dossiers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={evolutionDossiers}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="mois" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="nouveaux" name="Nouveaux" stroke="#3b82f6" strokeWidth={2} />
                      <Line type="monotone" dataKey="clos" name="Clos" stroke="#22c55e" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Indicateurs détaillés */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Indicateurs de performance
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
                    <span className="text-sm text-muted-foreground">85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Taux de numérisation</span>
                    <span className="text-sm text-muted-foreground">92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Satisfaction des usagers</span>
                    <span className="text-sm text-muted-foreground">78%</span>
                  </div>
                  <Progress value={78} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Taux de report</span>
                    <span className="text-sm text-muted-foreground">{tauxReport}%</span>
                  </div>
                  <Progress value={100 - tauxReport} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default GreffierStats;
