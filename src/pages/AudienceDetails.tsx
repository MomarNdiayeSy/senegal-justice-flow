import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Scale, Clock, Calendar as CalendarIcon, User, MapPin, ArrowLeft, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import { useApp } from "@/contexts/AppContext";
import { Audience } from "@/contexts/AppContext";

const AudienceDetails = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { audiences, users } = useApp();
  const audienceId = searchParams.get("id");
  const [audience, setAudience] = useState<Audience | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    // Gestion du mode hors ligne
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    if (audienceId) {
      const foundAudience = audiences.find(a => a.id === audienceId);
      if (foundAudience) {
        setAudience(foundAudience);
        // Cache l'audience dans le localStorage pour le mode hors ligne
        localStorage.setItem(`audience_${audienceId}`, JSON.stringify(foundAudience));
      } else {
        // Essayer de récupérer depuis le cache
        const cached = localStorage.getItem(`audience_${audienceId}`);
        if (cached) {
          setAudience(JSON.parse(cached));
        }
      }
    }
  }, [audienceId, audiences]);

  if (!audience) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <Card className="p-8 text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Audience introuvable</h2>
          <p className="text-muted-foreground mb-6">
            L'audience demandée n'existe pas ou a été supprimée.
          </p>
          <Button onClick={() => navigate("/public-display")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à l'affichage public
          </Button>
        </Card>
      </div>
    );
  }

  const juge = users.find(u => u.id === audience.jugeId);
  const procureur = audience.procureurId ? users.find(u => u.id === audience.procureurId) : null;
  const avocats = users.filter(u => audience.avocatIds.includes(u.id));

  const getStatusInfo = (statut: string) => {
    const variants = {
      prevue: { 
        label: "Prévue", 
        icon: "🟢",
        className: "bg-success text-success-foreground",
        message: "Cette audience aura lieu à l'heure prévue."
      },
      en_cours: { 
        label: "En cours", 
        icon: "🟡",
        className: "bg-accent text-accent-foreground animate-pulse",
        message: "Cette audience est actuellement en cours."
      },
      reportee: { 
        label: "Reportée", 
        icon: "🔵",
        className: "bg-primary text-primary-foreground",
        message: "Cette audience a été reportée. Veuillez consulter la nouvelle date."
      },
      terminee: { 
        label: "Terminée", 
        icon: "🔴",
        className: "bg-destructive text-destructive-foreground",
        message: "Cette audience est terminée."
      }
    };
    return variants[statut as keyof typeof variants] || variants.prevue;
  };

  const statusInfo = getStatusInfo(audience.statut);

  // Estimation du temps de passage (simple simulation)
  const getEstimatedTime = () => {
    const now = new Date();
    const audienceDate = new Date(`${audience.date}T${audience.heure}`);
    const diffMs = audienceDate.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 0) {
      if (audience.statut === "en_cours") {
        return "En cours actuellement";
      }
      return "Heure de passage dépassée";
    } else if (diffMins < 30) {
      return `Dans environ ${diffMins} minutes`;
    } else if (diffMins < 120) {
      return `Dans environ ${Math.floor(diffMins / 60)} heure${Math.floor(diffMins / 60) > 1 ? 's' : ''}`;
    } else {
      return `Aujourd'hui à ${audience.heure}`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4 md:p-8">
      {/* Mode hors ligne indicator */}
      {isOffline && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
        >
          <Badge variant="destructive" className="text-lg px-6 py-2 shadow-lg">
            ⚠️ Mode hors ligne - Données en cache
          </Badge>
        </motion.div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <Button
            variant="outline"
            onClick={() => navigate("/public-display")}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à l'affichage public
          </Button>

          <div className="flex items-center gap-4 mb-4">
            <Scale className="w-12 h-12 text-primary" />
            <div>
              <h1 className="text-4xl font-bold text-primary">
                Détails de l'audience
              </h1>
              <p className="text-muted-foreground">
                Ministère de la Justice - e-Justice Sénégal
              </p>
            </div>
          </div>
          <div className="h-1 bg-gradient-to-r from-primary via-accent to-primary rounded-full" />
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="overflow-hidden shadow-2xl">
            <div className="h-3 bg-gradient-to-r from-primary to-accent" />
            
            <div className="p-8">
              {/* Status Badge */}
              <div className="flex items-center justify-between mb-8">
                <Badge className={`${statusInfo.className} text-xl px-6 py-3 font-bold`}>
                  {statusInfo.icon} {statusInfo.label}
                </Badge>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Heure approximative</p>
                  <p className="text-lg font-semibold text-primary">{getEstimatedTime()}</p>
                </div>
              </div>

              {/* Info Alert */}
              <div className="bg-primary/10 border-l-4 border-primary p-4 mb-8 rounded">
                <p className="text-sm text-primary font-medium">
                  ℹ️ {statusInfo.message}
                </p>
              </div>

              {/* QR Code Section */}
              <div className="flex justify-center mb-8">
                <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-primary/20">
                  <QRCodeSVG
                    value={`${window.location.origin}/audience-details?id=${audience.id}`}
                    size={200}
                    level="H"
                    includeMargin
                  />
                  <p className="text-center text-sm text-muted-foreground mt-2">
                    Scannez pour partager
                  </p>
                </div>
              </div>

              {/* Infos principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground font-medium">N° Affaire</p>
                  <p className="text-2xl font-bold text-primary">{audience.numero}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Salle d'audience
                  </p>
                  <p className="text-2xl font-bold text-accent">{audience.salle}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    Date
                  </p>
                  <p className="text-xl font-semibold">
                    {new Date(audience.date).toLocaleDateString('fr-FR', { 
                      weekday: 'long', 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Heure
                  </p>
                  <p className="text-xl font-semibold">{audience.heure}</p>
                </div>
              </div>

              {/* Parties */}
              <div className="mb-8">
                <p className="text-sm text-muted-foreground font-medium mb-2">
                  Parties concernées
                </p>
                <Card className="p-4 bg-muted/50">
                  <p className="text-lg font-semibold">{audience.parties}</p>
                </Card>
              </div>

              {/* Personnel judiciaire */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personnel judiciaire
                </h3>

                {juge && (
                  <Card className="p-4 bg-primary/5 border-primary/20">
                    <p className="text-sm text-muted-foreground mb-1">Juge</p>
                    <p className="text-lg font-semibold text-primary">
                      {juge.prenom} {juge.nom}
                    </p>
                  </Card>
                )}

                {procureur && (
                  <Card className="p-4 bg-accent/5 border-accent/20">
                    <p className="text-sm text-muted-foreground mb-1">Procureur</p>
                    <p className="text-lg font-semibold text-accent">
                      {procureur.prenom} {procureur.nom}
                    </p>
                  </Card>
                )}

                {avocats.length > 0 && (
                  <Card className="p-4 bg-muted/30 border-muted">
                    <p className="text-sm text-muted-foreground mb-2">
                      Avocat{avocats.length > 1 ? 's' : ''}
                    </p>
                    <div className="space-y-1">
                      {avocats.map(avocat => (
                        <p key={avocat.id} className="text-base font-medium text-foreground">
                          • {avocat.prenom} {avocat.nom}
                        </p>
                      ))}
                    </div>
                  </Card>
                )}
              </div>

              {/* Historique */}
              {audience.historique.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-bold text-foreground mb-4">
                    Historique des modifications
                  </h3>
                  <div className="space-y-2">
                    {audience.historique.slice(-3).reverse().map((event, index) => (
                      <Card key={index} className="p-3 bg-muted/20 border-muted">
                        <div className="flex justify-between items-start">
                          <p className="text-sm text-foreground">{event.action}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(event.date).toLocaleString('fr-FR')}
                          </p>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-8 text-sm text-muted-foreground"
        >
          <p>
            Pour plus d'informations, rendez-vous sur le portail{" "}
            <a href={window.location.origin} className="text-primary font-semibold hover:underline">
              e-Justice Sénégal
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default AudienceDetails;
