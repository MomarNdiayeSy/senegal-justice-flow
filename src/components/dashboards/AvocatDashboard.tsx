import { motion } from "framer-motion";
import { Briefcase, Calendar, FileText, Bell, Upload, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApp } from "@/contexts/AppContext";
import { useState } from "react";

const AvocatDashboard = () => {
  const { audiences, dossiers, notifications, currentUser, users } = useApp();
  const [searchTerm, setSearchTerm] = useState("");

  // Filtrer les audiences de l'avocat
  const mesAudiences = audiences.filter(a => a.avocatIds.includes(currentUser?.id || ""));
  const audiencesPrevues = mesAudiences.filter(a => a.statut === "prevue");
  const mesNotifications = notifications.filter(n => n.destinataireId === currentUser?.id && !n.lue);

  const stats = [
    {
      title: "Mes dossiers clients",
      value: dossiers.length,
      icon: Briefcase,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Audiences planifiées",
      value: audiencesPrevues.length,
      icon: Calendar,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Notifications",
      value: mesNotifications.length,
      icon: Bell,
      color: "text-amber-600",
      bgColor: "bg-amber-50"
    },
    {
      title: "Documents",
      value: dossiers.reduce((acc, d) => acc + d.pieces.length, 0),
      icon: FileText,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
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
      prevue: "À venir",
      en_cours: "En cours",
      reportee: "Reportée",
      terminee: "Terminée"
    };
    return { style: styles[statut as keyof typeof styles], label: labels[statut as keyof typeof labels] };
  };

  const filteredDossiers = dossiers.filter(d => 
    d.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.titre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-primary">Cabinet d'Avocat</h1>
          <p className="text-muted-foreground mt-1">Gestion de vos dossiers et audiences</p>
        </div>
        <Button className="shadow-gold hover:scale-105 transition-smooth">
          <Upload className="w-4 h-4 mr-2" />
          Ajouter un document
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

      {/* Audiences à venir */}
      {audiencesPrevues.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="shadow-elegant border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Bell className="w-5 h-5" />
                Rappel : Audiences à venir
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {audiencesPrevues.slice(0, 3).map((audience) => {
                  const juge = users.find(u => u.id === audience.jugeId);
                  return (
                    <div key={audience.id} className="p-3 rounded-lg bg-blue-50 text-blue-900">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{audience.numero} - {audience.parties}</p>
                          <p className="text-sm">
                            📅 {new Date(audience.date).toLocaleDateString('fr-FR')} à {audience.heure}
                          </p>
                          <p className="text-sm">📍 {audience.salle} • ⚖️ {juge?.prenom} {juge?.nom}</p>
                        </div>
                        <Badge className="bg-blue-600 text-white">Dans {Math.ceil((new Date(audience.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} jour(s)</Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Mes affaires avec recherche */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="shadow-elegant">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" />
                Mes affaires en cours
              </CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher une affaire..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredDossiers.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Aucune affaire trouvée</p>
            ) : (
              <div className="space-y-3">
                {filteredDossiers.map((dossier) => {
                  const audience = audiences.find(a => a.dossierId === dossier.id);
                  const badge = audience ? getStatutBadge(audience.statut) : null;
                  return (
                    <div key={dossier.id} className="p-4 rounded-lg border bg-card hover:shadow-md transition-smooth">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-primary">{dossier.numero}</span>
                            {badge && <Badge className={badge.style}>{badge.label}</Badge>}
                          </div>
                          <p className="font-medium">{dossier.titre}</p>
                          <p className="text-sm text-muted-foreground">{dossier.description}</p>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-2">
                            <span>📎 {dossier.pieces.length} document(s)</span>
                            <span>📅 Créé le {new Date(dossier.dateCreation).toLocaleDateString('fr-FR')}</span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Voir détails
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
    </div>
  );
};

export default AvocatDashboard;
