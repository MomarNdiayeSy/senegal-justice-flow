import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Scale, FileText, Calendar, Clock, AlertCircle, CheckCircle, ScrollText, Bell, BarChart3, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";

const ProcureurDashboard = () => {
  const { audiences, dossiers, users, currentUser } = useApp();
  const navigate = useNavigate();
  // Filtrer les audiences du ministère public
  const audiencesParquet = audiences;
  const audiencesEnAttente = audiencesParquet.filter(a => a.statut === "prevue");
  const audiencesTraitees = audiencesParquet.filter(a => a.statut === "terminee");
  const audiencesAjournees = audiencesParquet.filter(a => a.statut === "reportee");

  const stats = [
    {
      title: "Affaires en attente",
      value: audiencesEnAttente.length,
      icon: Clock,
      color: "text-amber-600",
      bgColor: "bg-amber-50"
    },
    {
      title: "Affaires traitées",
      value: audiencesTraitees.length,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Ajournements",
      value: audiencesAjournees.length,
      icon: AlertCircle,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      title: "Dossiers actifs",
      value: dossiers.filter(d => d.statut !== "archive").length,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    }
  ];

  const getStatutBadge = (statut: string) => {
    const styles = {
      prevue: "bg-blue-100 text-blue-700",
      en_cours: "bg-amber-100 text-amber-700",
      reportee: "bg-orange-100 text-orange-700",
      terminee: "bg-green-100 text-green-700"
    };
    const labels = {
      prevue: "En attente",
      en_cours: "En cours",
      reportee: "Ajournée",
      terminee: "Traitée"
    };
    return { style: styles[statut as keyof typeof styles], label: labels[statut as keyof typeof labels] };
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-primary">Ministère Public</h1>
          <p className="text-muted-foreground mt-1">Suivi des affaires du parquet</p>
        </div>
        <Scale className="w-12 h-12 text-primary" />
      </motion.div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="shadow-elegant hover:shadow-gold transition-smooth">
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
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Audiences du ministère public */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Audiences du ministère public
            </CardTitle>
          </CardHeader>
          <CardContent>
            {audiencesParquet.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Aucune audience programmée</p>
            ) : (
              <div className="space-y-3">
                {audiencesParquet.slice(0, 6).map((audience) => {
                  const badge = getStatutBadge(audience.statut);
                  const juge = users.find(u => u.id === audience.jugeId);
                  return (
                    <div key={audience.id} className="p-4 rounded-lg border bg-card hover:shadow-md transition-smooth">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-primary">{audience.numero}</span>
                            <Badge className={badge.style}>{badge.label}</Badge>
                          </div>
                          <p className="font-medium">{audience.parties}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>📅 {new Date(audience.date).toLocaleDateString('fr-FR')}</span>
                            <span>🕐 {audience.heure}</span>
                            <span>📍 {audience.salle}</span>
                            {juge && <span>⚖️ {juge.prenom} {juge.nom}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Actions du Parquet */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ScrollText className="w-5 h-5 text-primary" />
              Actions du Ministère Public
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="h-auto py-6 flex-col gap-2"
                onClick={() => navigate("/procureur/affaires")}
              >
                <FileText className="w-8 h-8 text-primary" />
                <span className="font-semibold">Affaires du Parquet</span>
                <span className="text-xs text-muted-foreground">Suivi en temps réel</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto py-6 flex-col gap-2"
                onClick={() => navigate("/procureur/decisions")}
              >
                <Scale className="w-8 h-8 text-primary" />
                <span className="font-semibold">Décisions de Justice</span>
                <span className="text-xs text-muted-foreground">Consulter les décisions</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto py-6 flex-col gap-2"
                onClick={() => navigate("/procureur/stats")}
              >
                <BarChart3 className="w-8 h-8 text-primary" />
                <span className="font-semibold">Rapports & Stats</span>
                <span className="text-xs text-muted-foreground">Génération de rapports</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Notifications de reports */}
      {audiencesAjournees.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="shadow-elegant border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                <Bell className="w-5 h-5" />
                Notifications de reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {audiencesAjournees.slice(0, 3).map((audience) => {
                  const juge = users.find(u => u.id === audience.jugeId);
                  return (
                    <div key={audience.id} className="p-4 rounded-lg bg-orange-50 text-orange-900 border border-orange-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium mb-1">{audience.numero} - {audience.parties}</p>
                          <p className="text-sm mb-1">Date initiale: {new Date(audience.date).toLocaleDateString('fr-FR')} à {audience.heure}</p>
                          <p className="text-sm">Juge: {juge?.prenom} {juge?.nom}</p>
                        </div>
                        <Badge className="bg-orange-600 text-white">Ajournée</Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Réquisitoires en attente */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Réquisitoires et dossiers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dossiers.filter(d => d.statut === "en_cours").slice(0, 4).map((dossier) => (
                <div key={dossier.id} className="p-4 rounded-lg border bg-card hover:shadow-md transition-smooth">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-primary">{dossier.numero}</span>
                        <Badge className="bg-blue-100 text-blue-700">En cours</Badge>
                      </div>
                      <p className="font-medium">{dossier.titre}</p>
                      <p className="text-sm text-muted-foreground">{dossier.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        📎 {dossier.pieces.length} pièce(s) jointe(s)
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ProcureurDashboard;
