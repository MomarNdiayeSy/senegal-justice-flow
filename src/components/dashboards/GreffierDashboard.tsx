import { motion } from "framer-motion";
import { Calendar, Plus, Clock, AlertCircle, FileText, QrCode } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/contexts/AppContext";
import { useNavigate } from "react-router-dom";

const GreffierDashboard = () => {
  const { audiences, dossiers, users } = useApp();
  const navigate = useNavigate();

  const today = new Date().toISOString().split('T')[0];
  const audiencesToday = audiences.filter(a => a.date === today);
  const audiencesEnCours = audiences.filter(a => a.statut === "en_cours");
  const audiencesReportees = audiences.filter(a => a.statut === "reportee");

  const stats = [
    {
      title: "Audiences aujourd'hui",
      value: audiencesToday.length,
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "En cours",
      value: audiencesEnCours.length,
      icon: Clock,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Reportées",
      value: audiencesReportees.length,
      icon: AlertCircle,
      color: "text-amber-600",
      bgColor: "bg-amber-50"
    },
    {
      title: "Dossiers",
      value: dossiers.length,
      icon: FileText,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    }
  ];

  const getStatutBadge = (statut: string) => {
    const styles = {
      prevue: "bg-blue-100 text-blue-700",
      en_cours: "bg-green-100 text-green-700",
      reportee: "bg-amber-100 text-amber-700",
      terminee: "bg-gray-100 text-gray-700"
    };
    const labels = {
      prevue: "Prévue",
      en_cours: "En cours",
      reportee: "Reportée",
      terminee: "Terminée"
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
          <h1 className="text-3xl font-bold text-primary">Gestion des Audiences</h1>
          <p className="text-muted-foreground mt-1">Planning et organisation judiciaire</p>
        </div>
        <Button className="shadow-gold hover:scale-105 transition-smooth" onClick={() => navigate('/dashboard')}>
          <Plus className="w-4 h-4 mr-2" />
          Créer une audience
        </Button>
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
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Audiences du jour */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Audiences du jour
            </CardTitle>
          </CardHeader>
          <CardContent>
            {audiencesToday.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Aucune audience programmée aujourd'hui</p>
            ) : (
              <div className="space-y-3">
                {audiencesToday.map((audience) => {
                  const juge = users.find(u => u.id === audience.jugeId);
                  const badge = getStatutBadge(audience.statut);
                  return (
                    <div key={audience.id} className="p-4 rounded-lg border bg-card hover:shadow-md transition-smooth">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-primary">{audience.numero}</span>
                            <Badge className={badge.style}>{badge.label}</Badge>
                          </div>
                          <p className="font-medium">{audience.parties}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>🕐 {audience.heure}</span>
                            <span>📍 {audience.salle}</span>
                            <span>⚖️ {juge?.prenom} {juge?.nom}</span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => navigate('/public-display')}>
                          <QrCode className="w-4 h-4 mr-1" />
                          QR Code
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Alertes */}
      {audiencesReportees.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="shadow-elegant border-amber-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-700">
                <AlertCircle className="w-5 h-5" />
                Audiences reportées récemment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {audiencesReportees.slice(0, 3).map((audience) => (
                  <div key={audience.id} className="p-3 rounded-lg bg-amber-50 text-amber-900">
                    <p className="font-medium">{audience.numero} - {audience.parties}</p>
                    <p className="text-sm">Initialement prévue le {new Date(audience.date).toLocaleDateString('fr-FR')}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default GreffierDashboard;
