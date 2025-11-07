import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Activity, Users, Download, FileSpreadsheet, FileText, Brain, Calendar, AlertTriangle, CheckCircle2, BarChart3, Clock, UserX, Gavel, FileX } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import DashboardLayout from "@/components/DashboardLayout";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";

const Stats = () => {
  const { audiences, users } = useApp();
  const { toast } = useToast();
  const [aiPrediction, setAiPrediction] = useState(23);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Calculate statistics
  const totalAudiences = audiences.length;
  const audiencesEnCours = audiences.filter(a => a.statut === "en_cours").length;
  const audiencesPrevues = audiences.filter(a => a.statut === "prevue").length;
  const audiencesReportees = audiences.filter(a => a.statut === "reportee").length;
  const audiencesTerminees = audiences.filter(a => a.statut === "terminee").length;
  const tauxReport = totalAudiences > 0 ? ((audiencesReportees / totalAudiences) * 100).toFixed(1) : 0;

  // Colors for charts
  const COLORS = {
    primary: "hsl(210, 100%, 20%)",
    accent: "hsl(45, 64%, 53%)",
    green: "hsl(160, 84%, 39%)",
    blue: "hsl(210, 100%, 50%)",
    yellow: "hsl(45, 93%, 47%)",
    red: "hsl(0, 84%, 60%)",
    purple: "hsl(280, 67%, 55%)",
  };

  const metrics = [
    {
      title: "Total audiences",
      value: totalAudiences.toString(),
      change: "+12.5%",
      trend: "up",
      icon: Calendar,
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      title: "Taux de reports",
      value: `${tauxReport}%`,
      change: "-2.1%",
      trend: "down",
      icon: TrendingDown,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100"
    },
    {
      title: "En cours",
      value: audiencesEnCours.toString(),
      change: `${audiencesPrevues} prévues`,
      trend: "up",
      icon: Activity,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Utilisateurs actifs",
      value: users.length.toString(),
      change: "+23",
      trend: "up",
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-100"
    }
  ];

  // Data for charts
  const monthlyData = [
    { mois: "Jan", audiences: 45, reportees: 3, terminees: 40 },
    { mois: "Fév", audiences: 52, reportees: 5, terminees: 45 },
    { mois: "Mar", audiences: 48, reportees: 4, terminees: 42 },
    { mois: "Avr", audiences: 61, reportees: 6, terminees: 53 },
    { mois: "Mai", audiences: 55, reportees: 4, terminees: 49 },
    { mois: "Juin", audiences: 67, reportees: 7, terminees: 58 },
  ];

  const statusData = [
    { name: "Prévues", value: audiencesPrevues, color: COLORS.green },
    { name: "En cours", value: audiencesEnCours, color: COLORS.yellow },
    { name: "Reportées", value: audiencesReportees, color: COLORS.blue },
    { name: "Terminées", value: audiencesTerminees, color: COLORS.red },
  ];

  const jugesData = users
    .filter(u => u.role === "juge")
    .map(juge => ({
      nom: `${juge.prenom} ${juge.nom}`,
      audiences: audiences.filter(a => a.jugeId === juge.id).length,
      reportees: audiences.filter(a => a.jugeId === juge.id && a.statut === "reportee").length,
      terminees: audiences.filter(a => a.jugeId === juge.id && a.statut === "terminee").length,
    }))
    .slice(0, 5);

  const performanceData = [
    { tribunal: "Dakar", ponctualite: 92, efficacite: 88, satisfaction: 90 },
    { tribunal: "Thiès", ponctualite: 85, efficacite: 82, satisfaction: 87 },
    { tribunal: "Saint-Louis", ponctualite: 88, efficacite: 85, satisfaction: 86 },
    { tribunal: "Ziguinchor", ponctualite: 90, efficacite: 87, satisfaction: 89 },
  ];

  // Causes principales de retard (simulation IA)
  const delayReasons = [
    { cause: "Absence avocat", count: 15, percentage: 35, icon: UserX, color: COLORS.red },
    { cause: "Documents manquants", count: 10, percentage: 23, icon: FileX, color: COLORS.yellow },
    { cause: "Retard juge", count: 8, percentage: 19, icon: Clock, color: COLORS.blue },
    { cause: "Conflit calendrier", count: 6, percentage: 14, icon: Calendar, color: COLORS.purple },
    { cause: "Autre", count: 4, percentage: 9, icon: AlertTriangle, color: COLORS.accent },
  ];

  // Simulation IA: Recalcule périodiquement
  useEffect(() => {
    const interval = setInterval(() => {
      const newPrediction = Math.floor(Math.random() * 15) + 18; // 18-32%
      setAiPrediction(newPrediction);
    }, 30000); // Toutes les 30 secondes
    return () => clearInterval(interval);
  }, []);

  // Simulation analyse IA
  const runAIAnalysis = () => {
    setIsAnalyzing(true);
    toast({
      title: "🧠 Analyse IA en cours...",
      description: "Le modèle prédictif analyse les données historiques.",
    });
    
    setTimeout(() => {
      const newPrediction = Math.floor(Math.random() * 20) + 15;
      setAiPrediction(newPrediction);
      setIsAnalyzing(false);
      toast({
        title: "✅ Analyse terminée",
        description: `Nouveau risque de report: ${newPrediction}%`,
      });
    }, 3000);
  };

  const handleExport = (format: "pdf" | "excel") => {
    if (format === "pdf") {
      const doc = new jsPDF();
      
      // En-tête
      doc.setFontSize(20);
      doc.setTextColor(33, 84, 149);
      doc.text("Rapport d'Analytique e-Justice", 20, 20);
      
      doc.setFontSize(12);
      doc.setTextColor(100);
      doc.text(`Généré le: ${new Date().toLocaleDateString("fr-FR")}`, 20, 30);
      
      // Statistiques principales
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text("Statistiques Générales", 20, 45);
      
      const statsData = [
        ["Metric", "Valeur"],
        ["Total audiences", totalAudiences.toString()],
        ["En cours", audiencesEnCours.toString()],
        ["Prévues", audiencesPrevues.toString()],
        ["Reportées", audiencesReportees.toString()],
        ["Terminées", audiencesTerminees.toString()],
        ["Taux de report", `${tauxReport}%`],
        ["Risque IA de report", `${aiPrediction}%`],
      ];

      autoTable(doc, {
        startY: 50,
        head: [statsData[0]],
        body: statsData.slice(1),
        theme: "grid",
        headStyles: { fillColor: [33, 84, 149] },
      });

      // Causes de retard
      doc.text("Causes Principales de Retard", 20, (doc as any).lastAutoTable.finalY + 15);
      
      const delayData = delayReasons.map(r => [r.cause, r.count.toString(), `${r.percentage}%`]);
      
      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 20,
        head: [["Cause", "Nombre", "Pourcentage"]],
        body: delayData,
        theme: "striped",
        headStyles: { fillColor: [33, 84, 149] },
      });

      // Performance par juge
      doc.text("Performance par Juge", 20, (doc as any).lastAutoTable.finalY + 15);
      
      const jugeData = jugesData.map(j => [
        j.nom,
        j.audiences.toString(),
        j.terminees.toString(),
        j.reportees.toString()
      ]);

      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 20,
        head: [["Juge", "Total", "Terminées", "Reportées"]],
        body: jugeData,
        theme: "striped",
        headStyles: { fillColor: [33, 84, 149] },
      });

      doc.save(`rapport-ejustice-${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: "✅ Export PDF réussi",
        description: "Le rapport a été téléchargé avec succès.",
      });
    } else if (format === "excel") {
      // Créer un workbook
      const wb = XLSX.utils.book_new();

      // Feuille 1: Statistiques générales
      const statsSheet = [
        ["Rapport d'Analytique e-Justice"],
        [`Généré le: ${new Date().toLocaleDateString("fr-FR")}`],
        [],
        ["Metric", "Valeur"],
        ["Total audiences", totalAudiences],
        ["En cours", audiencesEnCours],
        ["Prévues", audiencesPrevues],
        ["Reportées", audiencesReportees],
        ["Terminées", audiencesTerminees],
        ["Taux de report (%)", tauxReport],
        ["Risque IA de report (%)", aiPrediction],
      ];
      const ws1 = XLSX.utils.aoa_to_sheet(statsSheet);
      XLSX.utils.book_append_sheet(wb, ws1, "Statistiques");

      // Feuille 2: Évolution mensuelle
      const ws2 = XLSX.utils.json_to_sheet(monthlyData);
      XLSX.utils.book_append_sheet(wb, ws2, "Évolution mensuelle");

      // Feuille 3: Performance par juge
      const ws3 = XLSX.utils.json_to_sheet(jugesData);
      XLSX.utils.book_append_sheet(wb, ws3, "Performance juges");

      // Feuille 4: Causes de retard
      const delaySheet = delayReasons.map(r => ({
        Cause: r.cause,
        Nombre: r.count,
        Pourcentage: `${r.percentage}%`
      }));
      const ws4 = XLSX.utils.json_to_sheet(delaySheet);
      XLSX.utils.book_append_sheet(wb, ws4, "Causes de retard");

      // Feuille 5: Performance tribunaux
      const ws5 = XLSX.utils.json_to_sheet(performanceData);
      XLSX.utils.book_append_sheet(wb, ws5, "Performance tribunaux");

      XLSX.writeFile(wb, `rapport-ejustice-${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast({
        title: "✅ Export Excel réussi",
        description: "Le rapport a été téléchargé avec succès.",
      });
    }
  };

  const generateMonthlyReport = () => {
    toast({
      title: "📊 Génération du rapport mensuel",
      description: "Le rapport du mois sera envoyé au Ministère dans quelques instants...",
    });

    setTimeout(() => {
      handleExport("pdf");
      toast({
        title: "✅ Rapport mensuel généré",
        description: "Le rapport a été généré et envoyé au Ministère.",
      });
    }, 2000);
  };

  const getRiskLevel = (prediction: number) => {
    if (prediction < 20) return { label: "Faible", color: "text-green-600", bgColor: "bg-green-100" };
    if (prediction < 40) return { label: "Modéré", color: "text-yellow-600", bgColor: "bg-yellow-100" };
    return { label: "Élevé", color: "text-red-600", bgColor: "bg-red-100" };
  };

  const riskLevel = getRiskLevel(aiPrediction);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-primary" />
              Analytique & Intelligence Artificielle
            </h2>
            <p className="text-muted-foreground">
              Vue d'ensemble des performances et prédictions IA
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleExport("pdf")}>
              <FileText className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
            <Button variant="outline" onClick={() => handleExport("excel")}>
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Export Excel
            </Button>
            <Button onClick={generateMonthlyReport}>
              <Download className="w-4 h-4 mr-2" />
              Rapport mensuel
            </Button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, index) => (
            <motion.div
              key={index}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <Card className="gradient-card border-0 shadow-md hover:shadow-xl transition-all glass-effect">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-full ${metric.bgColor}`}>
                      <metric.icon className={`w-6 h-6 ${metric.color}`} />
                    </div>
                    <span
                      className={`text-sm font-semibold ${
                        metric.trend === "up" ? "text-success" : "text-muted-foreground"
                      }`}
                    >
                      {metric.change}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{metric.title}</p>
                    <p className={`text-4xl font-bold ${metric.color}`}>{metric.value}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* IA Prediction Card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="shadow-lg border-2 border-primary/20 glass-effect overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-primary via-accent to-primary" />
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <Brain className="w-7 h-7 text-accent" />
                 </motion.div>
                 Prédiction IA - Risque de report
              </CardTitle>
              <CardDescription>
                Analyse prédictive basée sur l'historique et les tendances actuelles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <Badge className={`${riskLevel.bgColor} ${riskLevel.color} text-lg px-4 py-2`}>
                        Risque {riskLevel.label}
                      </Badge>
                      <span className="text-5xl font-bold text-primary">{aiPrediction}%</span>
                    </div>
                    <Progress value={aiPrediction} className="h-4 mb-2" />
                    <p className="text-sm text-muted-foreground mb-3">
                      Probabilité de report des audiences programmées cette semaine
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={runAIAnalysis}
                      disabled={isAnalyzing}
                    >
                      <Brain className="w-4 h-4 mr-2" />
                      {isAnalyzing ? "Analyse en cours..." : "Relancer l'analyse IA"}
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <p className="text-2xl font-bold text-green-600">77%</p>
                    </div>
                    <p className="text-sm text-muted-foreground">Taux de réussite</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Activity className="w-5 h-5 text-blue-600" />
                      <p className="text-2xl font-bold text-blue-600">89%</p>
                    </div>
                    <p className="text-sm text-muted-foreground">Précision IA</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-600" />
                      <p className="text-2xl font-bold text-yellow-600">12</p>
                    </div>
                    <p className="text-sm text-muted-foreground">Audiences à risque</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Causes de retard */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="shadow-md border-0 glass-effect">
            <CardHeader>
              <CardTitle>Causes principales de retard (Analyse IA)</CardTitle>
              <CardDescription>Distribution des motifs de report identifiés par l'IA</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {delayReasons.map((reason, index) => (
                  <motion.div
                    key={reason.cause}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="flex items-center gap-4"
                  >
                    <div 
                      className="p-3 rounded-full"
                      style={{ backgroundColor: `${reason.color}20` }}
                    >
                      <reason.icon 
                        className="w-5 h-5"
                        style={{ color: reason.color }}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-foreground">{reason.cause}</span>
                        <span className="text-sm text-muted-foreground">
                          {reason.count} cas ({reason.percentage}%)
                        </span>
                      </div>
                      <Progress value={reason.percentage} className="h-2" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Evolution Chart */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="shadow-md border-0 glass-effect">
              <CardHeader>
                <CardTitle>Évolution mensuelle des audiences</CardTitle>
                <CardDescription>Tendance sur les 6 derniers mois</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="mois" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="audiences"
                      stroke={COLORS.primary}
                      strokeWidth={3}
                      name="Total"
                      dot={{ r: 5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="reportees"
                      stroke={COLORS.red}
                      strokeWidth={3}
                      name="Reportées"
                      dot={{ r: 5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="terminees"
                      stroke={COLORS.green}
                      strokeWidth={3}
                      name="Terminées"
                      dot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Status Distribution */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="shadow-md border-0 glass-effect">
              <CardHeader>
                <CardTitle>Répartition par statut</CardTitle>
                <CardDescription>Distribution actuelle des audiences</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Performance by Judge */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="shadow-md border-0 glass-effect">
            <CardHeader>
              <CardTitle>Performance par juge (Top 5)</CardTitle>
              <CardDescription>Nombre d'audiences gérées</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={jugesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="nom" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="audiences" fill={COLORS.primary} name="Total audiences" />
                  <Bar dataKey="terminees" fill={COLORS.green} name="Terminées" />
                  <Bar dataKey="reportees" fill={COLORS.red} name="Reportées" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Radar Chart - Tribunal Performance */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="shadow-md border-0 glass-effect">
            <CardHeader>
              <CardTitle>Performance multicritère par tribunal</CardTitle>
              <CardDescription>Évaluation sur 3 axes: ponctualité, efficacité, satisfaction</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={performanceData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="tribunal" stroke="hsl(var(--foreground))" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="hsl(var(--muted-foreground))" />
                  <Radar
                    name="Ponctualité"
                    dataKey="ponctualite"
                    stroke={COLORS.blue}
                    fill={COLORS.blue}
                    fillOpacity={0.6}
                  />
                  <Radar
                    name="Efficacité"
                    dataKey="efficacite"
                    stroke={COLORS.accent}
                    fill={COLORS.accent}
                    fillOpacity={0.6}
                  />
                  <Radar
                    name="Satisfaction"
                    dataKey="satisfaction"
                    stroke={COLORS.green}
                    fill={COLORS.green}
                    fillOpacity={0.6}
                  />
                  <Legend />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Stats;
