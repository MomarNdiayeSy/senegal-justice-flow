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

  // Filter today's audiences
  const today = new Date().toDateString();
  const todayAudiences = audiences.filter(
    a => new Date(a.date).toDateString() === today
  ).sort((a, b) => a.heure.localeCompare(b.heure));

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
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(refreshInterval);
  }, []);

  const getStatusBadge = (statut: string) => {
    const variants = {
      prevue: { label: "🟢 Prévue", className: "bg-green-500 text-white text-2xl px-6 py-3 font-bold" },
      en_cours: { label: "🟡 En cours", className: "bg-yellow-500 text-white text-2xl px-6 py-3 font-bold animate-pulse" },
      reportee: { label: "🔵 Reportée", className: "bg-blue-500 text-white text-2xl px-6 py-3 font-bold" },
      terminee: { label: "🔴 Terminée", className: "bg-red-500 text-white text-2xl px-6 py-3 font-bold" }
    };

    const variant = variants[statut as keyof typeof variants] || variants.prevue;
    return <Badge className={`${variant.className} shadow-lg`}>{variant.label}</Badge>;
  };

  return (
    <div className={`min-h-screen p-8 transition-all duration-500 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white' 
        : 'bg-gradient-to-br from-blue-50 via-white to-blue-50 text-slate-900'
    }`}>
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
            isDarkMode ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-slate-800 hover:bg-slate-900'
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
              <Scale className={`w-24 h-24 ${isDarkMode ? 'text-yellow-400' : 'text-primary'}`} />
            </motion.div>
            <div>
              <h1 className={`text-7xl font-bold ${isDarkMode ? 'text-white' : 'text-primary'}`}>
                e-Justice Sénégal
              </h1>
              <p className={`text-3xl mt-2 ${isDarkMode ? 'text-yellow-400' : 'text-accent'} font-semibold`}>
                Ministère de la Justice
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className={`flex items-center gap-4 text-5xl font-bold ${isDarkMode ? 'text-yellow-400' : 'text-primary'}`}>
              <Clock className="w-14 h-14" />
              {currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className={`flex items-center gap-3 text-2xl mt-3 ${isDarkMode ? 'text-white/80' : 'text-muted-foreground'}`}>
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
            ? 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400' 
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
        <h2 className={`text-6xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-primary'}`}>
          Audiences du jour
        </h2>
        <div className="flex items-center justify-center gap-3">
          <Badge variant="outline" className={`text-xl px-6 py-2 ${
            isDarkMode ? 'border-white/30 text-white' : 'border-primary/30 text-primary'
          }`}>
            {todayAudiences.length} audience{todayAudiences.length > 1 ? 's' : ''} programmée{todayAudiences.length > 1 ? 's' : ''}
          </Badge>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <RefreshCw className={`w-5 h-5 ${isDarkMode ? 'text-yellow-400' : 'text-accent'}`} />
          </motion.div>
          <span className={`text-sm ${isDarkMode ? 'text-white/60' : 'text-muted-foreground'}`}>
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
              className={`text-center py-20 ${isDarkMode ? 'text-white/60' : 'text-muted-foreground'}`}
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
                  <Card className={`border-0 shadow-2xl overflow-hidden ${
                    isDarkMode 
                      ? 'bg-slate-800/90 backdrop-blur-sm' 
                      : 'bg-white/95 backdrop-blur-sm'
                  }`}>
                    <div className={`h-2 ${
                      isDarkMode 
                        ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' 
                        : 'bg-gradient-to-r from-primary to-accent'
                    }`} />
                    <div className="p-8">
                      <div className="flex items-center justify-between gap-8">
                        <div className="flex-1 grid grid-cols-5 gap-8 items-center">
                          {/* Numéro */}
                          <div>
                            <p className={`text-base mb-2 ${isDarkMode ? 'text-white/60' : 'text-muted-foreground'} font-medium`}>
                              N° Affaire
                            </p>
                            <p className={`text-3xl font-bold ${isDarkMode ? 'text-yellow-400' : 'text-primary'}`}>
                              {audience.numero}
                            </p>
                          </div>

                          {/* Parties */}
                          <div className="col-span-2">
                            <p className={`text-base mb-2 ${isDarkMode ? 'text-white/60' : 'text-muted-foreground'} font-medium`}>
                              Parties concernées
                            </p>
                            <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-foreground'}`}>
                              {audience.parties}
                            </p>
                            {juge && (
                              <p className={`text-lg mt-1 ${isDarkMode ? 'text-white/70' : 'text-muted-foreground'}`}>
                                Juge: {juge.prenom} {juge.nom}
                              </p>
                            )}
                          </div>

                          {/* Heure */}
                          <div>
                            <p className={`text-base mb-2 ${isDarkMode ? 'text-white/60' : 'text-muted-foreground'} font-medium`}>
                              Heure
                            </p>
                            <p className={`text-4xl font-bold ${isDarkMode ? 'text-yellow-400' : 'text-primary'}`}>
                              {audience.heure}
                            </p>
                          </div>

                          {/* Salle */}
                          <div>
                            <p className={`text-base mb-2 ${isDarkMode ? 'text-white/60' : 'text-muted-foreground'} font-medium`}>
                              Salle
                            </p>
                            <p className={`text-3xl font-bold ${isDarkMode ? 'text-yellow-400' : 'text-accent'}`}>
                              {audience.salle}
                            </p>
                          </div>
                        </div>

                        {/* Status & QR */}
                        <div className="flex items-center gap-8">
                          {getStatusBadge(audience.statut)}
                          <motion.div
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            className="bg-white p-4 rounded-2xl shadow-2xl"
                          >
                            <QRCodeSVG
                              value={`${window.location.origin}/public-display?audience=${audience.id}`}
                              size={140}
                              level="H"
                              includeMargin
                            />
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
        <div className={`inline-flex items-center gap-6 rounded-2xl px-10 py-6 shadow-2xl ${
          isDarkMode 
            ? 'bg-slate-800/80 backdrop-blur-lg border border-white/10' 
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
            <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-primary'}`}>
              Scannez pour plus d'informations
            </p>
            <p className={`text-lg ${isDarkMode ? 'text-white/70' : 'text-muted-foreground'}`}>
              Suivez vos audiences en ligne sur e-Justice
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PublicDisplay;
