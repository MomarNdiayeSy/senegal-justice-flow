import { useState } from "react";
import { motion } from "framer-motion";
import { Monitor, RefreshCw, Settings, QrCode, Eye, Play, Pause, Calendar, Clock, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { QRCodeSVG } from "qrcode.react";

const GreffierAffichage = () => {
  const { audiences, users } = useApp();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [config, setConfig] = useState({
    autoRefresh: true,
    refreshInterval: 30,
    showQrCode: true,
    salleFilter: "__all__",
    dateFilter: new Date().toISOString().split('T')[0],
    isPlaying: true
  });

  const today = config.dateFilter;
  const audiencesToday = audiences.filter(a => {
    const matchDate = a.date === today;
    const matchSalle = config.salleFilter === "__all__" || a.salle === config.salleFilter;
    return matchDate && matchSalle;
  });

  const audiencesEnCours = audiencesToday.filter(a => a.statut === "en_cours");
  const audiencesPrevues = audiencesToday.filter(a => a.statut === "prevue");
  const audiencesTerminees = audiencesToday.filter(a => a.statut === "terminee");

  const getStatutBadge = (statut: string) => {
    const config = {
      prevue: { style: "bg-blue-100 text-blue-700", label: "Prévue" },
      en_cours: { style: "bg-green-100 text-green-700 animate-pulse", label: "En cours" },
      reportee: { style: "bg-amber-100 text-amber-700", label: "Reportée" },
      terminee: { style: "bg-gray-100 text-gray-700", label: "Terminée" }
    };
    return config[statut as keyof typeof config];
  };

  const handleRefresh = () => {
    toast({ title: "Actualisation", description: "L'affichage a été actualisé" });
  };

  const salles = ["Salle 1", "Salle 2", "Salle 3", "Salle 4"];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-primary">Tableau d'Affichage</h1>
            <p className="text-muted-foreground mt-1">Gérer l'affichage numérique du tribunal</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </Button>
            <Button onClick={() => navigate('/public-display')}>
              <Eye className="w-4 h-4 mr-2" />
              Voir l'affichage public
            </Button>
          </div>
        </motion.div>

        {/* Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              Configuration de l'affichage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="autoRefresh">Actualisation auto</Label>
                <Switch
                  id="autoRefresh"
                  checked={config.autoRefresh}
                  onCheckedChange={(checked) => setConfig({ ...config, autoRefresh: checked })}
                />
              </div>
              <div>
                <Label>Intervalle (secondes)</Label>
                <Select 
                  value={config.refreshInterval.toString()} 
                  onValueChange={(value) => setConfig({ ...config, refreshInterval: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 secondes</SelectItem>
                    <SelectItem value="30">30 secondes</SelectItem>
                    <SelectItem value="60">1 minute</SelectItem>
                    <SelectItem value="120">2 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="showQr">Afficher QR Code</Label>
                <Switch
                  id="showQr"
                  checked={config.showQrCode}
                  onCheckedChange={(checked) => setConfig({ ...config, showQrCode: checked })}
                />
              </div>
              <div>
                <Label>Date</Label>
                <Input
                  type="date"
                  value={config.dateFilter}
                  onChange={(e) => setConfig({ ...config, dateFilter: e.target.value })}
                />
              </div>
            </div>
            <div className="mt-4">
              <Label>Filtrer par salle</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                <Button
                  variant={config.salleFilter === "__all__" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setConfig({ ...config, salleFilter: "__all__" })}
                >
                  Toutes les salles
                </Button>
                {salles.map(salle => (
                  <Button
                    key={salle}
                    variant={config.salleFilter === salle ? "default" : "outline"}
                    size="sm"
                    onClick={() => setConfig({ ...config, salleFilter: salle })}
                  >
                    {salle}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats rapides */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{audiencesToday.length}</p>
                <p className="text-sm text-muted-foreground">Total du jour</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-green-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{audiencesEnCours.length}</p>
                <p className="text-sm text-muted-foreground">En cours</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-amber-600">{audiencesPrevues.length}</p>
                <p className="text-sm text-muted-foreground">À venir</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-600">{audiencesTerminees.length}</p>
                <p className="text-sm text-muted-foreground">Terminées</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Aperçu de l'affichage */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Monitor className="w-5 h-5 text-primary" />
                Aperçu de l'affichage public
              </div>
              <div className="flex items-center gap-2">
                {config.autoRefresh && (
                  <Badge className="bg-green-100 text-green-700">
                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                    Auto-refresh: {config.refreshInterval}s
                  </Badge>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setConfig({ ...config, isPlaying: !config.isPlaying })}
                >
                  {config.isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg p-6 min-h-[400px]">
              {/* En-tête simulé */}
              <div className="text-center mb-6 pb-4 border-b border-border">
                <h2 className="text-2xl font-bold text-primary">Tribunal de Grande Instance de Dakar</h2>
                <p className="text-muted-foreground">
                  {new Date(config.dateFilter).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>

              {/* Contenu principal */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Audiences en cours */}
                <div className="lg:col-span-2">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                    Audiences en cours et à venir
                  </h3>
                  <div className="space-y-3">
                    {audiencesToday.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">Aucune audience programmée</p>
                    ) : (
                      audiencesToday.slice(0, 6).map((audience) => {
                        const juge = users.find(u => u.id === audience.jugeId);
                        const badge = getStatutBadge(audience.statut);
                        return (
                          <div key={audience.id} className="p-3 rounded-lg bg-card border shadow-sm">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-bold">{audience.numero}</span>
                                  <Badge className={badge.style}>{badge.label}</Badge>
                                </div>
                                <p className="text-sm font-medium">{audience.parties}</p>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {audience.heure}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {audience.salle}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* QR Code et infos */}
                {config.showQrCode && (
                  <div className="flex flex-col items-center justify-center">
                    <div className="bg-white p-4 rounded-lg shadow-md">
                      <QRCodeSVG
                        value={`${window.location.origin}/public-display`}
                        size={150}
                        level="H"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-3 text-center">
                      Scannez pour accéder<br />aux détails de votre affaire
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gestion par salle */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Répartition par salle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {salles.map(salle => {
                const audiencesSalle = audiencesToday.filter(a => a.salle === salle);
                const enCours = audiencesSalle.find(a => a.statut === "en_cours");
                return (
                  <div key={salle} className={`p-4 rounded-lg border ${enCours ? "border-green-300 bg-green-50" : "bg-card"}`}>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold">{salle}</h4>
                      <Badge className={audiencesSalle.length > 0 ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}>
                        {audiencesSalle.length} audience{audiencesSalle.length > 1 ? "s" : ""}
                      </Badge>
                    </div>
                    {enCours ? (
                      <div className="space-y-1">
                        <Badge className="bg-green-100 text-green-700 animate-pulse">En cours</Badge>
                        <p className="text-sm font-medium mt-2">{enCours.numero}</p>
                        <p className="text-xs text-muted-foreground">{enCours.parties}</p>
                      </div>
                    ) : audiencesSalle.length > 0 ? (
                      <div>
                        <p className="text-sm text-muted-foreground">Prochaine:</p>
                        <p className="text-sm font-medium">{audiencesSalle[0].heure} - {audiencesSalle[0].numero}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">Aucune audience</p>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default GreffierAffichage;
