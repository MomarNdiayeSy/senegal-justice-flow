import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Monitor, Calendar, Clock, MapPin, Users, RefreshCw, ArrowRight, CheckCircle, AlertCircle, Timer, Scale, QrCode } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "@/contexts/AppContext";
import DashboardLayout from "@/components/DashboardLayout";
import { QRCodeSVG } from "qrcode.react";

const JusticiableTableauAffichage = () => {
  const { audiences, users } = useApp();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedSalle, setSelectedSalle] = useState("all");
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Auto-refresh current time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const refreshTimer = setInterval(() => {
      setLastRefresh(new Date());
    }, 30000);
    return () => clearInterval(refreshTimer);
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const audiencesAujourdhui = audiences.filter(a => a.date === today);

  const salles = [...new Set(audiencesAujourdhui.map(a => a.salle))];

  const filteredAudiences = selectedSalle === "all" 
    ? audiencesAujourdhui 
    : audiencesAujourdhui.filter(a => a.salle === selectedSalle);

  // Trier par heure
  const sortedAudiences = [...filteredAudiences].sort((a, b) => 
    a.heure.localeCompare(b.heure)
  );

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { icon: React.ReactNode; className: string; label: string }> = {
      "prevue": { 
        icon: <Clock className="w-3 h-3" />, 
        className: "bg-blue-500 text-white", 
        label: "À venir" 
      },
      "en_cours": { 
        icon: <Timer className="w-3 h-3" />, 
        className: "bg-green-500 text-white animate-pulse", 
        label: "En cours" 
      },
      "reportee": { 
        icon: <AlertCircle className="w-3 h-3" />, 
        className: "bg-red-500 text-white", 
        label: "Reportée" 
      },
      "terminee": { 
        icon: <CheckCircle className="w-3 h-3" />, 
        className: "bg-gray-500 text-white", 
        label: "Terminée" 
      }
    };
    const style = styles[status] || { icon: null, className: "bg-gray-500", label: status };
    return (
      <Badge className={`${style.className} flex items-center gap-1`}>
        {style.icon}
        {style.label}
      </Badge>
    );
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.nom || "Non assigné";
  };

  const handleRefresh = () => {
    setLastRefresh(new Date());
  };

  // Statistiques du jour
  const stats = {
    total: audiencesAujourdhui.length,
    enCours: audiencesAujourdhui.filter(a => a.statut === "en_cours").length,
    aVenir: audiencesAujourdhui.filter(a => a.statut === "prevue").length,
    terminees: audiencesAujourdhui.filter(a => a.statut === "terminee").length,
    reportees: audiencesAujourdhui.filter(a => a.statut === "reportee").length
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header avec horloge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
              <Monitor className="w-8 h-8" />
              Tableau d'Affichage
            </h1>
            <p className="text-muted-foreground mt-1">
              Audiences du jour - {new Date().toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-3xl font-bold text-primary tabular-nums">
                {currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </div>
              <p className="text-xs text-muted-foreground">
                Dernière actualisation: {lastRefresh.toLocaleTimeString('fr-FR')}
              </p>
            </div>
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </motion.div>

        {/* Statistiques rapides */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-4"
        >
          <Card className="shadow-elegant">
            <CardContent className="p-4 text-center">
              <Scale className="w-6 h-6 text-primary mx-auto mb-1" />
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </CardContent>
          </Card>
          <Card className="shadow-elegant border-green-200">
            <CardContent className="p-4 text-center">
              <Timer className="w-6 h-6 text-green-600 mx-auto mb-1" />
              <div className="text-2xl font-bold text-green-600">{stats.enCours}</div>
              <div className="text-xs text-muted-foreground">En cours</div>
            </CardContent>
          </Card>
          <Card className="shadow-elegant border-blue-200">
            <CardContent className="p-4 text-center">
              <Clock className="w-6 h-6 text-blue-600 mx-auto mb-1" />
              <div className="text-2xl font-bold text-blue-600">{stats.aVenir}</div>
              <div className="text-xs text-muted-foreground">À venir</div>
            </CardContent>
          </Card>
          <Card className="shadow-elegant border-gray-200">
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-6 h-6 text-gray-600 mx-auto mb-1" />
              <div className="text-2xl font-bold text-gray-600">{stats.terminees}</div>
              <div className="text-xs text-muted-foreground">Terminées</div>
            </CardContent>
          </Card>
          <Card className="shadow-elegant border-red-200">
            <CardContent className="p-4 text-center">
              <AlertCircle className="w-6 h-6 text-red-600 mx-auto mb-1" />
              <div className="text-2xl font-bold text-red-600">{stats.reportees}</div>
              <div className="text-xs text-muted-foreground">Reportées</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filtre par salle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="shadow-elegant">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <MapPin className="w-5 h-5 text-primary" />
                <span className="font-medium">Filtrer par salle:</span>
                <Select value={selectedSalle} onValueChange={setSelectedSalle}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Toutes les salles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les salles</SelectItem>
                    {salles.map(salle => (
                      <SelectItem key={salle} value={salle}>{salle}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Liste des audiences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Programme des Audiences ({sortedAudiences.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sortedAudiences.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Aucune audience programmée aujourd'hui</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedAudiences.map((audience, index) => (
                    <motion.div
                      key={audience.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-4 rounded-lg border ${
                        audience.statut === "en_cours" 
                          ? "bg-green-50 border-green-300 dark:bg-green-900/20" 
                          : audience.statut === "reportee"
                          ? "bg-red-50 border-red-200 dark:bg-red-900/20"
                          : "bg-card"
                      } hover:shadow-md transition-all`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-lg ${
                            audience.statut === "en_cours" 
                              ? "bg-green-500 text-white" 
                              : "bg-primary/10"
                          }`}>
                            <Clock className="w-6 h-6" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <span className="text-xl font-bold">{audience.heure}</span>
                              {getStatusBadge(audience.statut)}
                            </div>
                            <h3 className="font-semibold">{audience.numero}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                              <Users className="w-4 h-4" />
                              {audience.parties}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                          <div className="text-sm space-y-1">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-primary" />
                              <span className="font-medium">{audience.salle}</span>
                            </div>
                            <div className="text-muted-foreground">
                              Juge: {getUserName(audience.jugeId)}
                            </div>
                          </div>
                          <div className="p-2 bg-white rounded-lg shadow-sm">
                            <QRCodeSVG
                              value={`${window.location.origin}/audience-details?id=${audience.id}`}
                              size={60}
                              level="M"
                            />
                          </div>
                        </div>
                      </div>
                      {audience.statut === "en_cours" && (
                        <div className="mt-3 pt-3 border-t border-green-200 flex items-center gap-2 text-green-700">
                          <ArrowRight className="w-4 h-4" />
                          <span className="text-sm font-medium">Cette audience est actuellement en cours</span>
                        </div>
                      )}
                      {audience.statut === "reportee" && (
                        <div className="mt-3 pt-3 border-t border-red-200 flex items-center gap-2 text-red-700">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">Cette audience a été reportée. Consultez vos notifications pour la nouvelle date.</span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Information QR Code */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="shadow-elegant border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <QrCode className="w-6 h-6 text-primary mt-0.5" />
                <div>
                  <h4 className="font-semibold text-primary">Scannez le QR Code</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Scannez le QR code à côté de chaque affaire pour accéder aux détails complets sur votre téléphone : 
                    parties, juge assigné, documents associés et historique.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default JusticiableTableauAffichage;
