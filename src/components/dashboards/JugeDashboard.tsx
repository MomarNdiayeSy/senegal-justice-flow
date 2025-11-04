import { motion } from "framer-motion";
import { Scale, Calendar, FileText, CheckCircle, Clock, TrendingUp, PenTool, History, Folder } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";
import { useNavigate } from "react-router-dom";

const JugeDashboard = () => {
  const { audiences, dossiers, currentUser, users } = useApp();
  const navigate = useNavigate();

  const mesAudiences = audiences.filter(a => a.jugeId === currentUser?.id);
  const audiencesTerminees = mesAudiences.filter(a => a.statut === "terminee");
  const audiencesEnCours = mesAudiences.filter(a => a.statut === "en_cours");
  const audiencesPrevues = mesAudiences.filter(a => a.statut === "prevue");

  const stats = [
    {
      title: "Audiences attribuées",
      value: mesAudiences.length,
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "En cours",
      value: audiencesEnCours.length,
      icon: Clock,
      color: "text-amber-600",
      bgColor: "bg-amber-50"
    },
    {
      title: "Terminées",
      value: audiencesTerminees.length,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Dossiers en cours",
      value: dossiers.filter(d => d.statut === "en_cours").length,
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
      prevue: "Prévue",
      en_cours: "En cours",
      reportee: "Reportée",
      terminee: "Terminée"
    };
    return { style: styles[statut as keyof typeof styles], label: labels[statut as keyof typeof labels] };
  };

  const tauxCompletion = mesAudiences.length > 0 
    ? Math.round((audiencesTerminees.length / mesAudiences.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-primary">Espace Magistrat</h1>
          <p className="text-muted-foreground mt-1">Suivi des audiences et décisions judiciaires</p>
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

      {/* Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Performance et activité
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">Taux de traitement des affaires</span>
                <span className="text-muted-foreground">{tauxCompletion}%</span>
              </div>
              <Progress value={tauxCompletion} className="h-3" />
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="text-center p-3 rounded-lg bg-blue-50">
                <div className="text-2xl font-bold text-blue-600">{audiencesPrevues.length}</div>
                <div className="text-xs text-blue-600">À venir</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-amber-50">
                <div className="text-2xl font-bold text-amber-600">{audiencesEnCours.length}</div>
                <div className="text-xs text-amber-600">En cours</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-green-50">
                <div className="text-2xl font-bold text-green-600">{audiencesTerminees.length}</div>
                <div className="text-xs text-green-600">Terminées</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Actions judiciaires */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PenTool className="w-5 h-5 text-primary" />
              Actions judiciaires
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-auto py-6 flex-col gap-2">
                <PenTool className="w-8 h-8 text-primary" />
                <span className="font-semibold">Rédiger une décision</span>
                <span className="text-xs text-muted-foreground">Nouvelle décision judiciaire</span>
              </Button>
              <Button variant="outline" className="h-auto py-6 flex-col gap-2" onClick={() => navigate('/dossiers')}>
                <Folder className="w-8 h-8 text-primary" />
                <span className="font-semibold">Dossiers en cours</span>
                <span className="text-xs text-muted-foreground">Consulter les affaires</span>
              </Button>
              <Button variant="outline" className="h-auto py-6 flex-col gap-2">
                <History className="w-8 h-8 text-primary" />
                <span className="font-semibold">Historique</span>
                <span className="text-xs text-muted-foreground">Affaires terminées</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Planning personnel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Mon planning personnel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"].map((jour, index) => {
                const date = new Date();
                date.setDate(date.getDate() + index);
                const dateStr = date.toISOString().split('T')[0];
                const audiencesJour = mesAudiences.filter(a => a.date === dateStr);
                return (
                  <div key={jour} className="p-3 rounded-lg border bg-card hover:shadow-md transition-smooth">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{jour} {date.getDate()}/{date.getMonth() + 1}</p>
                        <p className="text-sm text-muted-foreground">
                          {audiencesJour.length} audience{audiencesJour.length > 1 ? 's' : ''}
                        </p>
                      </div>
                      {audiencesJour.length > 0 && (
                        <Badge className="bg-blue-100 text-blue-700">
                          {audiencesJour[0].heure}
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Mes audiences */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Mes audiences attribuées
            </CardTitle>
          </CardHeader>
          <CardContent>
            {mesAudiences.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Aucune audience attribuée</p>
            ) : (
              <div className="space-y-3">
                {mesAudiences.slice(0, 5).map((audience) => {
                  const badge = getStatutBadge(audience.statut);
                  const avocat = users.find(u => audience.avocatIds.includes(u.id));
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
                          </div>
                          {avocat && (
                            <p className="text-sm text-muted-foreground">
                              👔 Me {avocat.prenom} {avocat.nom}
                            </p>
                          )}
                        </div>
                        <Button size="sm" variant="outline">
                          Consulter
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

export default JugeDashboard;
