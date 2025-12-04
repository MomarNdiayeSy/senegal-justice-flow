import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Users, Calendar, Shield, Activity, AlertTriangle, TrendingUp, TrendingDown,
  Settings, BarChart3, Building2, UserPlus, Gavel, FileText, Clock, 
  CheckCircle2, XCircle, PauseCircle, MapPin, Download, RefreshCw,
  Eye, ChevronRight, Globe, Landmark, Scale
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useApp } from "@/contexts/AppContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";

const AdminDashboard = () => {
  const { users, audiences, dossiers, logs } = useApp();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Tribunaux connectés (simulation)
  const tribunaux = [
    { id: "dakar", name: "Tribunal de Dakar", region: "Dakar", status: "operationnel", affaires: 245, jugees: 180, reportees: 32, enCours: 33, delaiMoyen: 45 },
    { id: "thies", name: "Tribunal de Thiès", region: "Thiès", status: "operationnel", affaires: 156, jugees: 120, reportees: 18, enCours: 18, delaiMoyen: 52 },
    { id: "stlouis", name: "Tribunal de Saint-Louis", region: "Saint-Louis", status: "operationnel", affaires: 98, jugees: 75, reportees: 12, enCours: 11, delaiMoyen: 38 },
    { id: "ziguinchor", name: "Tribunal de Ziguinchor", region: "Ziguinchor", status: "maintenance", affaires: 67, jugees: 52, reportees: 8, enCours: 7, delaiMoyen: 41 },
    { id: "kaolack", name: "Tribunal de Kaolack", region: "Kaolack", status: "operationnel", affaires: 89, jugees: 68, reportees: 11, enCours: 10, delaiMoyen: 48 },
    { id: "tambacounda", name: "Tribunal de Tambacounda", region: "Tambacounda", status: "operationnel", affaires: 54, jugees: 42, reportees: 6, enCours: 6, delaiMoyen: 55 },
  ];

  // Calculs nationaux
  const totalAffaires = tribunaux.reduce((sum, t) => sum + t.affaires, 0);
  const totalJugees = tribunaux.reduce((sum, t) => sum + t.jugees, 0);
  const totalReportees = tribunaux.reduce((sum, t) => sum + t.reportees, 0);
  const totalEnCours = tribunaux.reduce((sum, t) => sum + t.enCours, 0);
  const delaiMoyenNational = Math.round(tribunaux.reduce((sum, t) => sum + t.delaiMoyen, 0) / tribunaux.length);
  const tauxReport = ((totalReportees / totalAffaires) * 100).toFixed(1);
  const tauxReussite = ((totalJugees / totalAffaires) * 100).toFixed(1);

  // KPIs principaux
  const kpis = [
    {
      title: "Affaires enregistrées",
      value: totalAffaires.toLocaleString(),
      change: "+12.5%",
      trend: "up",
      icon: FileText,
      color: "text-primary",
      bgColor: "bg-primary/10",
      description: "Total national"
    },
    {
      title: "Affaires jugées",
      value: totalJugees.toLocaleString(),
      change: "+8.3%",
      trend: "up",
      icon: Gavel,
      color: "text-green-600",
      bgColor: "bg-green-100",
      description: `${tauxReussite}% de résolution`
    },
    {
      title: "Affaires reportées",
      value: totalReportees.toLocaleString(),
      change: "-2.1%",
      trend: "down",
      icon: PauseCircle,
      color: "text-amber-600",
      bgColor: "bg-amber-100",
      description: `${tauxReport}% de taux de report`
    },
    {
      title: "Délai moyen",
      value: `${delaiMoyenNational}j`,
      change: "-5 jours",
      trend: "down",
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      description: "Temps de traitement"
    }
  ];

  // Données pour le graphique d'évolution mensuelle
  const evolutionMensuelle = [
    { mois: "Jan", enregistrees: 120, jugees: 95, reportees: 12 },
    { mois: "Fév", enregistrees: 135, jugees: 110, reportees: 15 },
    { mois: "Mar", enregistrees: 148, jugees: 125, reportees: 11 },
    { mois: "Avr", enregistrees: 162, jugees: 140, reportees: 14 },
    { mois: "Mai", enregistrees: 175, jugees: 152, reportees: 13 },
    { mois: "Juin", enregistrees: 190, jugees: 168, reportees: 12 },
  ];

  // Données pour le graphique de répartition par région
  const repartitionRegionale = tribunaux.map(t => ({
    name: t.region,
    value: t.affaires,
    color: t.status === "operationnel" ? "hsl(160, 84%, 39%)" : "hsl(45, 93%, 47%)"
  }));

  const COLORS = ["#003366", "#C4A34A", "#10B981", "#3B82F6", "#8B5CF6", "#EC4899"];

  // Rapports consolidés reçus (simulation)
  const rapportsConsolides = [
    { tribunal: "Dakar", date: "2024-01-15", type: "Mensuel", statut: "reçu" },
    { tribunal: "Thiès", date: "2024-01-14", type: "Mensuel", statut: "reçu" },
    { tribunal: "Saint-Louis", date: "2024-01-13", type: "Mensuel", statut: "reçu" },
    { tribunal: "Ziguinchor", date: "2024-01-12", type: "Mensuel", statut: "en_attente" },
  ];

  // Points de blocage identifiés
  const pointsBlocage = [
    { cause: "Absence d'avocat", count: 45, percentage: 35, severity: "high" },
    { cause: "Documents manquants", count: 32, percentage: 25, severity: "medium" },
    { cause: "Retard des juges", count: 18, percentage: 14, severity: "medium" },
    { cause: "Conflit de calendrier", count: 15, percentage: 12, severity: "low" },
    { cause: "Problèmes techniques", count: 8, percentage: 6, severity: "low" },
  ];

  // Actualisation des données
  const refreshData = () => {
    setIsRefreshing(true);
    toast({
      title: "Actualisation en cours...",
      description: "Synchronisation avec tous les tribunaux",
    });
    
    setTimeout(() => {
      setLastUpdate(new Date());
      setIsRefreshing(false);
      toast({
        title: "✓ Données actualisées",
        description: "Tous les tribunaux sont synchronisés",
      });
    }, 2000);
  };

  // Auto-refresh toutes les 60 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "operationnel":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Opérationnel</Badge>;
      case "maintenance":
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Maintenance</Badge>;
      case "hors_ligne":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Hors ligne</Badge>;
      default:
        return <Badge variant="secondary">Inconnu</Badge>;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "bg-red-500";
      case "medium": return "bg-amber-500";
      case "low": return "bg-blue-500";
      default: return "bg-muted";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header avec titre et actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-full bg-primary/10">
              <Globe className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-primary">Tableau de Bord National</h1>
              <p className="text-muted-foreground">Ministère de la Justice - Vue d'ensemble des tribunaux</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
            <Clock className="w-4 h-4" />
            Dernière mise à jour: {lastUpdate.toLocaleString('fr-FR')}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            onClick={refreshData}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          <Button variant="outline" onClick={() => navigate('/admin/stats')} className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Statistiques
          </Button>
          <Button variant="outline" onClick={() => navigate('/admin/audit')} className="gap-2">
            <Shield className="w-4 h-4" />
            Audit
          </Button>
          <Button className="shadow-gold gap-2" onClick={() => navigate('/admin/users')}>
            <Users className="w-4 h-4" />
            Utilisateurs
          </Button>
        </div>
      </motion.div>

      {/* KPIs Nationaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -5 }}
          >
            <Card className="shadow-md hover:shadow-lg transition-all border-0 glass-effect">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-full ${kpi.bgColor}`}>
                    <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
                  </div>
                  <span className={`text-sm font-semibold flex items-center gap-1 ${
                    kpi.trend === "up" ? "text-green-600" : "text-blue-600"
                  }`}>
                    {kpi.trend === "up" ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {kpi.change}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-1">{kpi.title}</p>
                <p className={`text-4xl font-bold ${kpi.color}`}>{kpi.value}</p>
                <p className="text-xs text-muted-foreground mt-2">{kpi.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Carte des tribunaux connectés */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="shadow-md border-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Landmark className="w-6 h-6 text-primary" />
                <div>
                  <CardTitle>Tribunaux Connectés</CardTitle>
                  <CardDescription>Statut en temps réel de tous les tribunaux du réseau</CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                {tribunaux.filter(t => t.status === "operationnel").length}/{tribunaux.length} en ligne
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tribunaux.map((tribunal, index) => (
                <motion.div
                  key={tribunal.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  className="p-4 rounded-lg border bg-card hover:shadow-md transition-all cursor-pointer"
                  onClick={() => toast({
                    title: tribunal.name,
                    description: `Affaires: ${tribunal.affaires} | Jugées: ${tribunal.jugees} | Délai: ${tribunal.delaiMoyen}j`
                  })}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold">{tribunal.name}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {tribunal.region}
                      </p>
                    </div>
                    {getStatusBadge(tribunal.status)}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="p-2 rounded bg-muted/50">
                      <p className="text-muted-foreground text-xs">Affaires</p>
                      <p className="font-bold">{tribunal.affaires}</p>
                    </div>
                    <div className="p-2 rounded bg-green-50">
                      <p className="text-muted-foreground text-xs">Jugées</p>
                      <p className="font-bold text-green-600">{tribunal.jugees}</p>
                    </div>
                    <div className="p-2 rounded bg-amber-50">
                      <p className="text-muted-foreground text-xs">Reportées</p>
                      <p className="font-bold text-amber-600">{tribunal.reportees}</p>
                    </div>
                    <div className="p-2 rounded bg-blue-50">
                      <p className="text-muted-foreground text-xs">Délai moy.</p>
                      <p className="font-bold text-blue-600">{tribunal.delaiMoyen}j</p>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Taux de résolution</span>
                      <span className="font-medium">{((tribunal.jugees / tribunal.affaires) * 100).toFixed(0)}%</span>
                    </div>
                    <Progress value={(tribunal.jugees / tribunal.affaires) * 100} className="h-2" />
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Évolution mensuelle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="shadow-md border-0 h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Évolution Mensuelle Nationale
              </CardTitle>
              <CardDescription>Tendances des affaires sur les 6 derniers mois</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={evolutionMensuelle}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="mois" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }} 
                  />
                  <Legend />
                  <Line type="monotone" dataKey="enregistrees" stroke="#003366" strokeWidth={2} name="Enregistrées" />
                  <Line type="monotone" dataKey="jugees" stroke="#10B981" strokeWidth={2} name="Jugées" />
                  <Line type="monotone" dataKey="reportees" stroke="#F59E0B" strokeWidth={2} name="Reportées" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Répartition par tribunal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="shadow-md border-0 h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Répartition par Tribunal
              </CardTitle>
              <CardDescription>Volume d'affaires par juridiction</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={tribunaux} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                  <YAxis dataKey="region" type="category" width={100} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }} 
                  />
                  <Bar dataKey="affaires" fill="#003366" radius={[0, 4, 4, 0]} name="Affaires" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Points de blocage et Rapports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Points de blocage */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="shadow-md border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Points de Blocage Identifiés
              </CardTitle>
              <CardDescription>Causes principales des retards dans les procédures</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pointsBlocage.map((blocage, index) => (
                  <motion.div
                    key={blocage.cause}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getSeverityColor(blocage.severity)}`} />
                        <span className="font-medium">{blocage.cause}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{blocage.count} cas</span>
                        <Badge variant="outline">{blocage.percentage}%</Badge>
                      </div>
                    </div>
                    <Progress value={blocage.percentage} className="h-2" />
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Rapports consolidés */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="shadow-md border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Rapports Consolidés
              </CardTitle>
              <CardDescription>Rapports mensuels reçus des greffes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {rapportsConsolides.map((rapport, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${rapport.statut === "reçu" ? "bg-green-100" : "bg-amber-100"}`}>
                        {rapport.statut === "reçu" ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        ) : (
                          <Clock className="w-4 h-4 text-amber-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">Tribunal de {rapport.tribunal}</p>
                        <p className="text-sm text-muted-foreground">{rapport.type} - {new Date(rapport.date).toLocaleDateString('fr-FR')}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="gap-1">
                      <Eye className="w-4 h-4" />
                      Voir
                    </Button>
                  </motion.div>
                ))}
              </div>
              <Separator className="my-4" />
              <Button variant="outline" className="w-full gap-2">
                <Download className="w-4 h-4" />
                Télécharger tous les rapports
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Performance par acteur */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <Card className="shadow-md border-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Scale className="w-6 h-6 text-primary" />
                <div>
                  <CardTitle>Performance des Acteurs Judiciaires</CardTitle>
                  <CardDescription>Audit et suivi des performances par tribunal, juge et greffier</CardDescription>
                </div>
              </div>
              <Button variant="outline" onClick={() => navigate('/admin/audit')} className="gap-2">
                Voir l'audit complet
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Performance Tribunaux */}
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-2 mb-4">
                  <Landmark className="w-5 h-5 text-primary" />
                  <h3 className="font-bold">Tribunaux</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Meilleur délai</span>
                    <Badge className="bg-green-100 text-green-700">Saint-Louis (38j)</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Plus productif</span>
                    <Badge className="bg-blue-100 text-blue-700">Dakar (245 affaires)</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Moins de reports</span>
                    <Badge className="bg-purple-100 text-purple-700">Tambacounda (11%)</Badge>
                  </div>
                </div>
              </div>

              {/* Performance Juges */}
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-2 mb-4">
                  <Gavel className="w-5 h-5 text-primary" />
                  <h3 className="font-bold">Juges</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Plus d'audiences</span>
                    <Badge className="bg-green-100 text-green-700">Juge Ba (45)</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Meilleur taux</span>
                    <Badge className="bg-blue-100 text-blue-700">Juge Ndiaye (92%)</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Moins de délai</span>
                    <Badge className="bg-purple-100 text-purple-700">Juge Diop (32j)</Badge>
                  </div>
                </div>
              </div>

              {/* Performance Greffiers */}
              <div className="p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-primary" />
                  <h3 className="font-bold">Greffiers</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Plus de dossiers</span>
                    <Badge className="bg-green-100 text-green-700">M. Sow (120)</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Validation rapide</span>
                    <Badge className="bg-blue-100 text-blue-700">Mme Fall (24h)</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Meilleur suivi</span>
                    <Badge className="bg-purple-100 text-purple-700">M. Diallo (98%)</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Activité récente */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
      >
        <Card className="shadow-md border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Activité Récente du Système
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {logs.slice(0, 5).map((log) => {
                const user = users.find(u => u.id === log.userId);
                return (
                  <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
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
