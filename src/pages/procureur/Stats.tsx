import { useState } from "react";
import { motion } from "framer-motion";
import { Scale, BarChart3, Download, Calendar, TrendingUp, TrendingDown, FileText, Clock, CheckCircle, AlertCircle, PieChart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "@/contexts/AppContext";
import DashboardLayout from "@/components/DashboardLayout";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart as RechartsPie, Pie, Cell, Legend } from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const ProcureurStats = () => {
  const { audiences, dossiers, currentUser } = useApp();
  const [periode, setPeriode] = useState("trimestre");

  // Données statistiques simulées
  const statsGlobales = {
    affairesTotal: 156,
    affairesClôturées: 98,
    affairesEnCours: 42,
    affairesReportées: 16,
    tauxCondamnation: 67,
    tauxRelaxe: 23,
    tauxRenvoi: 10,
    delaiMoyen: 45,
    delaiMoyenPrecedent: 52
  };

  // Données par mois
  const evolutionMensuelle = [
    { mois: "Sept", nouvelles: 18, clôturées: 15, reportées: 3 },
    { mois: "Oct", nouvelles: 22, clôturées: 19, reportées: 4 },
    { mois: "Nov", nouvelles: 20, clôturées: 21, reportées: 2 },
    { mois: "Déc", nouvelles: 25, clôturées: 22, reportées: 5 },
    { mois: "Jan", nouvelles: 28, clôturées: 24, reportées: 3 },
    { mois: "Fév", nouvelles: 24, clôturées: 26, reportées: 2 }
  ];

  // Types d'infractions
  const typesInfractions = [
    { name: "Vol/Escroquerie", value: 35, color: "#3b82f6" },
    { name: "Violence", value: 25, color: "#ef4444" },
    { name: "Stupéfiants", value: 18, color: "#f59e0b" },
    { name: "Économique", value: 12, color: "#10b981" },
    { name: "Autres", value: 10, color: "#8b5cf6" }
  ];

  // Résultats des poursuites
  const resultatsPoursuite = [
    { name: "Condamnation", value: statsGlobales.tauxCondamnation, color: "#ef4444" },
    { name: "Relaxe", value: statsGlobales.tauxRelaxe, color: "#10b981" },
    { name: "Renvoi", value: statsGlobales.tauxRenvoi, color: "#f59e0b" }
  ];

  // Délais de traitement
  const delaisTraitement = [
    { type: "Vol simple", delai: 30 },
    { type: "Escroquerie", delai: 45 },
    { type: "Violence", delai: 38 },
    { type: "Stupéfiants", delai: 52 },
    { type: "Économique", delai: 68 }
  ];

  // Export PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Rapport Statistique - Ministère Public", 14, 22);
    doc.setFontSize(11);
    doc.text(`Période: ${periode === "trimestre" ? "Dernier trimestre" : periode === "semestre" ? "Dernier semestre" : "Dernière année"}`, 14, 32);
    doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`, 14, 40);

    // Statistiques globales
    doc.setFontSize(14);
    doc.text("Statistiques Globales", 14, 55);
    autoTable(doc, {
      startY: 60,
      head: [["Indicateur", "Valeur"]],
      body: [
        ["Affaires totales", statsGlobales.affairesTotal.toString()],
        ["Affaires clôturées", statsGlobales.affairesClôturées.toString()],
        ["Affaires en cours", statsGlobales.affairesEnCours.toString()],
        ["Affaires reportées", statsGlobales.affairesReportées.toString()],
        ["Taux de condamnation", `${statsGlobales.tauxCondamnation}%`],
        ["Délai moyen", `${statsGlobales.delaiMoyen} jours`]
      ]
    });

    // Évolution mensuelle
    const finalY = (doc as any).lastAutoTable.finalY || 120;
    doc.setFontSize(14);
    doc.text("Évolution Mensuelle", 14, finalY + 15);
    autoTable(doc, {
      startY: finalY + 20,
      head: [["Mois", "Nouvelles", "Clôturées", "Reportées"]],
      body: evolutionMensuelle.map(m => [m.mois, m.nouvelles.toString(), m.clôturées.toString(), m.reportées.toString()])
    });

    doc.save(`rapport-parquet-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Export Excel
  const exportExcel = () => {
    const wb = XLSX.utils.book_new();

    // Feuille stats globales
    const wsStats = XLSX.utils.json_to_sheet([
      { Indicateur: "Affaires totales", Valeur: statsGlobales.affairesTotal },
      { Indicateur: "Affaires clôturées", Valeur: statsGlobales.affairesClôturées },
      { Indicateur: "Affaires en cours", Valeur: statsGlobales.affairesEnCours },
      { Indicateur: "Taux de condamnation", Valeur: `${statsGlobales.tauxCondamnation}%` },
      { Indicateur: "Délai moyen", Valeur: `${statsGlobales.delaiMoyen} jours` }
    ]);
    XLSX.utils.book_append_sheet(wb, wsStats, "Statistiques");

    // Feuille évolution
    const wsEvolution = XLSX.utils.json_to_sheet(evolutionMensuelle);
    XLSX.utils.book_append_sheet(wb, wsEvolution, "Évolution");

    // Feuille types infractions
    const wsTypes = XLSX.utils.json_to_sheet(typesInfractions.map(t => ({ Type: t.name, Pourcentage: `${t.value}%` })));
    XLSX.utils.book_append_sheet(wb, wsTypes, "Types Infractions");

    XLSX.writeFile(wb, `rapport-parquet-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const variationDelai = statsGlobales.delaiMoyen - statsGlobales.delaiMoyenPrecedent;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
              <BarChart3 className="w-8 h-8" />
              Rapports & Statistiques
            </h1>
            <p className="text-muted-foreground mt-1">Analyse des performances du Ministère Public</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={periode} onValueChange={setPeriode}>
              <SelectTrigger className="w-40">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="trimestre">Trimestre</SelectItem>
                <SelectItem value="semestre">Semestre</SelectItem>
                <SelectItem value="annee">Année</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={exportPDF} variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              PDF
            </Button>
            <Button onClick={exportExcel} variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Excel
            </Button>
          </div>
        </motion.div>

        {/* KPIs principaux */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
            <Card className="shadow-elegant">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Affaires totales</p>
                    <p className="text-3xl font-bold text-primary">{statsGlobales.affairesTotal}</p>
                  </div>
                  <FileText className="w-10 h-10 text-primary/30" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
            <Card className="shadow-elegant">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Clôturées</p>
                    <p className="text-3xl font-bold text-green-600">{statsGlobales.affairesClôturées}</p>
                    <p className="text-xs text-green-600">
                      {Math.round((statsGlobales.affairesClôturées / statsGlobales.affairesTotal) * 100)}% du total
                    </p>
                  </div>
                  <CheckCircle className="w-10 h-10 text-green-600/30" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
            <Card className="shadow-elegant">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Taux condamnation</p>
                    <p className="text-3xl font-bold text-red-600">{statsGlobales.tauxCondamnation}%</p>
                  </div>
                  <Scale className="w-10 h-10 text-red-600/30" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
            <Card className="shadow-elegant">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Délai moyen</p>
                    <p className="text-3xl font-bold">{statsGlobales.delaiMoyen}j</p>
                    <div className={`flex items-center gap-1 text-xs ${variationDelai < 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {variationDelai < 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                      {Math.abs(variationDelai)} jours
                    </div>
                  </div>
                  <Clock className="w-10 h-10 text-muted-foreground/30" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Évolution mensuelle */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Évolution mensuelle des affaires
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={evolutionMensuelle}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mois" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="nouvelles" name="Nouvelles" fill="#3b82f6" />
                  <Bar dataKey="clôturées" name="Clôturées" fill="#10b981" />
                  <Bar dataKey="reportées" name="Reportées" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Résultats des poursuites */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-primary" />
                Résultats des poursuites
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPie>
                  <Pie
                    data={resultatsPoursuite}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {resultatsPoursuite.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPie>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Types d'infractions */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-primary" />
                Répartition par type d'infraction
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPie>
                  <Pie
                    data={typesInfractions}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {typesInfractions.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </RechartsPie>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Délais par type */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Délais moyens par type d'affaire (jours)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={delaisTraitement} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="type" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="delai" fill="#003366" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Tableau récapitulatif */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle>Récapitulatif des performances</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold">Indicateur</th>
                    <th className="text-center p-3 font-semibold">Période actuelle</th>
                    <th className="text-center p-3 font-semibold">Période précédente</th>
                    <th className="text-center p-3 font-semibold">Variation</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="p-3">Nouvelles affaires</td>
                    <td className="p-3 text-center font-medium">156</td>
                    <td className="p-3 text-center">142</td>
                    <td className="p-3 text-center text-green-600">+9.8%</td>
                  </tr>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="p-3">Affaires clôturées</td>
                    <td className="p-3 text-center font-medium">98</td>
                    <td className="p-3 text-center">85</td>
                    <td className="p-3 text-center text-green-600">+15.3%</td>
                  </tr>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="p-3">Taux de condamnation</td>
                    <td className="p-3 text-center font-medium">67%</td>
                    <td className="p-3 text-center">62%</td>
                    <td className="p-3 text-center text-green-600">+5 pts</td>
                  </tr>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="p-3">Délai moyen de traitement</td>
                    <td className="p-3 text-center font-medium">45 jours</td>
                    <td className="p-3 text-center">52 jours</td>
                    <td className="p-3 text-center text-green-600">-13.5%</td>
                  </tr>
                  <tr className="hover:bg-muted/50">
                    <td className="p-3">Taux de report</td>
                    <td className="p-3 text-center font-medium">10%</td>
                    <td className="p-3 text-center">14%</td>
                    <td className="p-3 text-center text-green-600">-4 pts</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ProcureurStats;