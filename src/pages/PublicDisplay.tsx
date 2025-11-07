import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scale, Clock, Calendar as CalendarIcon, Sun, Moon, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import { useApp } from "@/contexts/AppContext";

const PublicDisplay = () => {
  const { audiences, users } = useApp();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [cachedAudiences, setCachedAudiences] = useState<typeof audiences>([]);

  // Filter today's audiences (utilise cache en mode hors ligne)
  const today = new Date().toDateString();
  const audiencesSource = isOffline && cachedAudiences.length > 0 ? cachedAudiences : audiences;
  const todayAudiences = audiencesSource.filter(
    a => new Date(a.date).toDateString() === today
  ).sort((a, b) => a.heure.localeCompare(b.heure));

  // Gestion du mode hors ligne
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Mise en cache des audiences pour le mode hors ligne
  useEffect(() => {
    if (audiences.length > 0) {
      localStorage.setItem("cached_audiences", JSON.stringify(audiences));
      localStorage.setItem("cached_users", JSON.stringify(users));
      setCachedAudiences(audiences);
    } else {
      // Charge depuis le cache au démarrage
      const cached = localStorage.getItem("cached_audiences");
      if (cached) {
        setCachedAudiences(JSON.parse(cached));
      }
    }
  }, [audiences, users]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Auto-refresh simulation (WebSocket simulation)
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      setLastRefresh(new Date());
      // En mode hors ligne, on ne rafraîchit pas les données
      if (!isOffline) {
        // Ici, dans un cas réel, on déclencherait un refetch des données
        console.log("Rafraîchissement des données...");
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(refreshInterval);
  }, [isOffline]);

  const getStatusBadge = (statut: string) => {
    const variants = {
      prevue: { label: "🟢 Prévue", className: "bg-success text-success-foreground text-2xl px-6 py-3 font-bold" },
      en_cours: { label: "🟡 En cours", className: "bg-accent text-accent-foreground text-2xl px-6 py-3 font-bold animate-pulse" },
      reportee: { label: "🔵 Reportée", className: "bg-primary text-primary-foreground text-2xl px-6 py-3 font-bold" },
      terminee: { label: "🔴 Terminée", className: "bg-destructive text-destructive-foreground text-2xl px-6 py-3 font-bold" }
    };

    const variant = variants[statut as keyof typeof variants] || variants.prevue;
    return <Badge className={`${variant.className} shadow-lg`}>{variant.label}</Badge>;
  };

  return (
    <div className={`min-h-screen p-8 transition-smooth ${
      isDarkMode 
        ? 'bg-background text-foreground' 
        : 'bg-gradient-to-br from-blue-50 via-white to-blue-50 text-foreground'
    }`}>
      {/* Mode hors ligne indicator */}
      {isOffline && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50"
        >
          <Badge variant="destructive" className="text-xl px-6 py-3 shadow-2xl animate-pulse">
            ⚠️ Mode hors ligne - Affichage des données en cache
          </Badge>
        </motion.div>
      )}

      {/* Mode Toggle */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed top-6 right-6 z-50"
      >
        <Button
          onClick={() => setIsDarkMode(!isDarkMode)}
          size="lg"
          className={`rounded-full w-16 h-16 shadow-2xl ${
            isDarkMode ? 'bg-accent hover:bg-accent/90' : 'bg-primary hover:bg-primary/90'
          }`}
        >
          {isDarkMode ? <Sun className="w-8 h-8" /> : <Moon className="w-8 h-8" />}
        </Button>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-12"
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-6">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
            >
              <Scale className={`w-24 h-24 ${isDarkMode ? 'text-accent' : 'text-primary'}`} />
            </motion.div>
            <div>
              <h1 className={`text-7xl font-bold ${isDarkMode ? 'text-foreground' : 'text-primary'}`}>
                e-Justice Sénégal
              </h1>
              <p className={`text-3xl mt-2 ${isDarkMode ? 'text-accent' : 'text-accent'} font-semibold`}>
                Ministère de la Justice
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className={`flex items-center gap-4 text-5xl font-bold ${isDarkMode ? 'text-accent' : 'text-primary'}`}>
              <Clock className="w-14 h-14" />
              {currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className={`flex items-center gap-3 text-2xl mt-3 ${isDarkMode ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
              <CalendarIcon className="w-9 h-9" />
              {currentTime.toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
            </div>
          </div>
        </div>

        <div className={`h-3 rounded-full shadow-lg ${
          isDarkMode 
            ? 'bg-gradient-to-r from-accent via-primary to-accent' 
            : 'bg-gradient-to-r from-primary via-accent to-primary'
        }`} />
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-10"
      >
        <h2 className={`text-6xl font-bold mb-4 ${isDarkMode ? 'text-foreground' : 'text-primary'}`}>
          Audiences du jour
        </h2>
        <div className="flex items-center justify-center gap-3">
          <Badge variant="outline" className={`text-xl px-6 py-2 ${
            isDarkMode ? 'border-border text-foreground' : 'border-primary/30 text-primary'
          }`}>
            {todayAudiences.length} audience{todayAudiences.length > 1 ? 's' : ''} programmée{todayAudiences.length > 1 ? 's' : ''}
          </Badge>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <RefreshCw className={`w-5 h-5 ${isDarkMode ? 'text-accent' : 'text-accent'}`} />
          </motion.div>
          <span className={`text-sm ${isDarkMode ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
            Dernière mise à jour : {lastRefresh.toLocaleTimeString('fr-FR')}
          </span>
        </div>
      </motion.div>

      {/* Audiences Grid */}
      <div className="space-y-6 mb-12">
        <AnimatePresence mode="popLayout">
          {todayAudiences.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`text-center py-20 ${isDarkMode ? 'text-muted-foreground' : 'text-muted-foreground'}`}
            >
              <Scale className="w-32 h-32 mx-auto mb-6 opacity-30" />
              <p className="text-4xl font-semibold">Aucune audience programmée aujourd'hui</p>
            </motion.div>
          ) : (
            todayAudiences.map((audience, index) => {
              const juge = users.find(u => u.id === audience.jugeId);
              
              return (
                <motion.div
                  key={audience.id}
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 100, opacity: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.02, y: -5 }}
                >
                  <Card className={`border-0 shadow-elegant overflow-hidden ${
                    isDarkMode 
                      ? 'bg-card backdrop-blur-sm' 
                      : 'bg-white/95 backdrop-blur-sm'
                  }`}>
                    <div className={`h-2 ${
                      isDarkMode 
                        ? 'bg-gradient-to-r from-accent to-primary' 
                        : 'bg-gradient-to-r from-primary to-accent'
                    }`} />
                    <div className="p-8">
                      <div className="flex items-center justify-between gap-8">
                        <div className="flex-1 grid grid-cols-5 gap-8 items-center">
                          {/* Numéro */}
                          <div>
                            <p className={`text-base mb-2 text-muted-foreground font-medium`}>
                              N° Affaire
                            </p>
                            <p className={`text-3xl font-bold ${isDarkMode ? 'text-accent' : 'text-primary'}`}>
                              {audience.numero}
                            </p>
                          </div>

                          {/* Parties */}
                          <div className="col-span-2">
                            <p className={`text-base mb-2 text-muted-foreground font-medium`}>
                              Parties concernées
                            </p>
                            <p className={`text-2xl font-bold text-foreground`}>
                              {audience.parties}
                            </p>
                            {juge && (
                              <p className={`text-lg mt-1 text-muted-foreground`}>
                                Juge: {juge.prenom} {juge.nom}
                              </p>
                            )}
                          </div>

                          {/* Heure */}
                          <div>
                            <p className={`text-base mb-2 text-muted-foreground font-medium`}>
                              Heure
                            </p>
                            <p className={`text-4xl font-bold ${isDarkMode ? 'text-accent' : 'text-primary'}`}>
                              {audience.heure}
                            </p>
                          </div>

                          {/* Salle */}
                          <div>
                            <p className={`text-base mb-2 text-muted-foreground font-medium`}>
                              Salle
                            </p>
                            <p className={`text-3xl font-bold ${isDarkMode ? 'text-accent' : 'text-accent'}`}>
                              {audience.salle}
                            </p>
                          </div>
                        </div>

                        {/* Status & QR */}
                        <div className="flex items-center gap-8">
                          {getStatusBadge(audience.statut)}
                          <motion.div
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            className="bg-white p-4 rounded-2xl shadow-2xl cursor-pointer"
                            onClick={() => window.open(`/audience-details?id=${audience.id}`, '_blank')}
                          >
                            <QRCodeSVG
                              value={`${window.location.origin}/audience-details?id=${audience.id}`}
                              size={140}
                              level="H"
                              includeMargin
                            />
                            <p className="text-center text-xs text-primary mt-2 font-medium">
                              Scannez pour<br/>plus de détails
                            </p>
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center"
      >
        <div className={`inline-flex items-center gap-6 rounded-2xl px-10 py-6 shadow-elegant ${
          isDarkMode 
            ? 'bg-card/80 backdrop-blur-lg border border-border' 
            : 'bg-white/80 backdrop-blur-lg border border-primary/10'
        }`}>
          <div className="w-20 h-20 bg-white rounded-2xl p-3 shadow-lg">
            <QRCodeSVG
              value={window.location.origin}
              size={68}
              level="H"
            />
          </div>
          <div className="text-left">
            <p className={`text-2xl font-bold ${isDarkMode ? 'text-foreground' : 'text-primary'}`}>
              Scannez pour plus d'informations
            </p>
            <p className={`text-lg text-muted-foreground`}>
              Suivez vos audiences en ligne sur e-Justice
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PublicDisplay;
