import { motion } from "framer-motion";
import { FileText, Calendar, MapPin, QrCode, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useApp } from "@/contexts/AppContext";
import { useNavigate } from "react-router-dom";

const JusticiableDashboard = () => {
  const { audiences, dossiers, currentUser, users } = useApp();
  const navigate = useNavigate();

  // Trouver l'audience du justiciable
  const monAudience = audiences.find(a => a.justiciableId === currentUser?.id);
  const monDossier = monAudience ? dossiers.find(d => d.audienceId === monAudience.id) : null;

  const getStatutInfo = (statut: string) => {
    const info = {
      prevue: {
        label: "Audience prévue",
        color: "bg-blue-100 text-blue-700",
        icon: Calendar,
        message: "Votre audience est programmée"
      },
      en_cours: {
        label: "En cours",
        color: "bg-green-100 text-green-700",
        icon: Clock,
        message: "Votre audience est en cours de traitement"
      },
      reportee: {
        label: "Reportée",
        color: "bg-amber-100 text-amber-700",
        icon: Calendar,
        message: "Votre audience a été reportée"
      },
      terminee: {
        label: "Terminée",
        color: "bg-green-100 text-green-700",
        icon: CheckCircle,
        message: "Votre audience a été traitée"
      }
    };
    return info[statut as keyof typeof info] || info.prevue;
  };

  const statutInfo = monAudience ? getStatutInfo(monAudience.statut) : null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-primary">Mon Espace Justiciable</h1>
        <p className="text-muted-foreground mt-2">Suivez l'état de votre affaire en temps réel</p>
      </motion.div>

      {!monAudience ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="shadow-elegant text-center">
            <CardContent className="py-12">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Aucune affaire en cours</h2>
              <p className="text-muted-foreground">
                Vous n'avez actuellement aucune affaire enregistrée dans le système.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <>
          {/* Statut de l'affaire */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="shadow-elegant border-2 border-primary/20">
              <CardHeader className="text-center bg-gradient-to-r from-primary/5 to-accent/5">
                <div className="flex justify-center mb-4">
                  {statutInfo && <statutInfo.icon className="w-12 h-12 text-primary" />}
                </div>
                <CardTitle className="text-2xl">Statut de votre affaire</CardTitle>
              </CardHeader>
              <CardContent className="text-center py-6">
                {statutInfo && (
                  <>
                    <Badge className={`${statutInfo.color} text-lg px-6 py-2 mb-4`}>
                      {statutInfo.label}
                    </Badge>
                    <p className="text-lg text-muted-foreground">{statutInfo.message}</p>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Informations de l'audience */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Détails de l'audience
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Numéro de dossier</p>
                    <p className="font-bold text-primary text-lg">{monAudience.numero}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Affaire</p>
                    <p className="font-semibold">{monAudience.parties}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">📅 Date</p>
                    <p className="font-semibold">{new Date(monAudience.date).toLocaleDateString('fr-FR', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">🕐 Heure</p>
                    <p className="font-semibold text-lg">{monAudience.heure}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">📍 Salle</p>
                    <p className="font-semibold">{monAudience.salle}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">⚖️ Juge</p>
                    <p className="font-semibold">
                      {(() => {
                        const juge = users.find(u => u.id === monAudience.jugeId);
                        return juge ? `${juge.prenom} ${juge.nom}` : 'Non assigné';
                      })()}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">👔 Votre avocat</p>
                  <p className="font-semibold">
                    {(() => {
                      const avocat = users.find(u => monAudience.avocatIds.includes(u.id));
                      return avocat ? `Me ${avocat.prenom} ${avocat.nom}` : 'Non assigné';
                    })()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* QR Code personnel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="shadow-elegant">
              <CardHeader className="text-center">
                <CardTitle className="flex items-center justify-center gap-2">
                  <QrCode className="w-5 h-5 text-primary" />
                  QR Code de suivi
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="bg-gradient-to-br from-primary/5 to-accent/5 p-8 rounded-lg inline-block">
                  <div className="bg-white p-4 rounded-lg shadow-md">
                    <QrCode className="w-32 h-32 text-primary mx-auto" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4 mb-4">
                  Scannez ce code pour accéder rapidement aux informations de votre audience
                </p>
                <Button 
                  className="shadow-gold hover:scale-105 transition-smooth"
                  onClick={() => navigate('/public-display')}
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Voir sur l'affichage public
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Informations du dossier */}
          {monDossier && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Résumé du dossier
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Titre</p>
                    <p className="font-semibold">{monDossier.titre}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Description</p>
                    <p className="text-muted-foreground">{monDossier.description}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Date de création</p>
                    <p>{new Date(monDossier.dateCreation).toLocaleDateString('fr-FR')}</p>
                  </div>
                  {monDossier.pieces.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">📎 Pièces jointes</p>
                      <div className="space-y-2">
                        {monDossier.pieces.map((piece) => (
                          <div key={piece.id} className="p-2 rounded bg-muted/50 text-sm">
                            {piece.nom} ({piece.taille})
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Historique des décisions */}
          {monAudience && monAudience.statut === "terminee" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="shadow-elegant border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="w-5 h-5" />
                    Décision rendue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 rounded-lg bg-green-50">
                    <p className="font-semibold text-green-900 mb-2">Affaire clôturée</p>
                    <p className="text-sm text-green-800">
                      La décision a été rendue le {new Date(monAudience.date).toLocaleDateString('fr-FR')}.
                    </p>
                    <p className="text-sm text-green-800 mt-2">
                      Pour obtenir une copie de la décision, veuillez contacter le greffe du tribunal.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};

export default JusticiableDashboard;
