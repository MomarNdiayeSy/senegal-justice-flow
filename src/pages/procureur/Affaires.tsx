import { useState } from "react";
import { motion } from "framer-motion";
import { Scale, Search, Filter, FileText, Calendar, Clock, Eye, AlertCircle, CheckCircle, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApp } from "@/contexts/AppContext";
import DashboardLayout from "@/components/DashboardLayout";

const ProcureurAffaires = () => {
  const { audiences, dossiers, users, currentUser } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedDossier, setSelectedDossier] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Filtrer les affaires du parquet (où le procureur est assigné)
  const affairesParquet = audiences.filter(a => 
    a.procureurId === currentUser?.id || 
    currentUser?.role === "procureur" // Pour la démo, afficher toutes les audiences
  );

  const dossierParquet = dossiers.filter(d => 
    d.accessList.includes(currentUser?.id || "") ||
    currentUser?.role === "procureur"
  );

  // Filtres
  const filteredAffaires = affairesParquet.filter(affaire => {
    const matchSearch = 
      affaire.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      affaire.parties.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "all" || affaire.statut === statusFilter;
    return matchSearch && matchStatus;
  });

  const getStatutBadge = (statut: string) => {
    const styles: Record<string, { bg: string; text: string; label: string }> = {
      prevue: { bg: "bg-blue-100", text: "text-blue-700", label: "Programmée" },
      en_cours: { bg: "bg-amber-100", text: "text-amber-700", label: "En cours" },
      reportee: { bg: "bg-orange-100", text: "text-orange-700", label: "Reportée" },
      terminee: { bg: "bg-green-100", text: "text-green-700", label: "Terminée" }
    };
    return styles[statut] || styles.prevue;
  };

  const getDossierDetails = (audience: any) => {
    return dossierParquet.find(d => d.numero === audience.dossierId);
  };

  const stats = [
    { label: "Affaires en cours", value: affairesParquet.filter(a => a.statut === "en_cours" || a.statut === "prevue").length, icon: Clock, color: "text-blue-600" },
    { label: "Affaires terminées", value: affairesParquet.filter(a => a.statut === "terminee").length, icon: CheckCircle, color: "text-green-600" },
    { label: "Affaires reportées", value: affairesParquet.filter(a => a.statut === "reportee").length, icon: AlertCircle, color: "text-orange-600" },
    { label: "Total dossiers", value: dossierParquet.length, icon: FileText, color: "text-primary" }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
              <Scale className="w-8 h-8" />
              Affaires du Parquet
            </h1>
            <p className="text-muted-foreground mt-1">Suivi en temps réel des affaires du ministère public</p>
          </div>
          <Button variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </Button>
        </motion.div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="shadow-elegant">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <stat.icon className={`w-8 h-8 ${stat.color}`} />
                    <div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Filtres */}
        <Card className="shadow-elegant">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par numéro ou parties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="prevue">Programmée</SelectItem>
                  <SelectItem value="en_cours">En cours</SelectItem>
                  <SelectItem value="reportee">Reportée</SelectItem>
                  <SelectItem value="terminee">Terminée</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Liste des affaires */}
        <Tabs defaultValue="audiences" className="space-y-4">
          <TabsList>
            <TabsTrigger value="audiences">Audiences ({filteredAffaires.length})</TabsTrigger>
            <TabsTrigger value="dossiers">Dossiers ({dossierParquet.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="audiences">
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Audiences du Ministère Public
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredAffaires.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Aucune affaire trouvée</p>
                ) : (
                  <div className="space-y-3">
                    {filteredAffaires.map((affaire) => {
                      const badge = getStatutBadge(affaire.statut);
                      const juge = users.find(u => u.id === affaire.jugeId);
                      const dossier = getDossierDetails(affaire);
                      
                      return (
                        <motion.div
                          key={affaire.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="p-4 rounded-lg border bg-card hover:shadow-md transition-smooth"
                        >
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-primary text-lg">{affaire.numero}</span>
                                <Badge className={`${badge.bg} ${badge.text}`}>{badge.label}</Badge>
                                {affaire.statut === "reportee" && (
                                  <Badge variant="destructive" className="animate-pulse">Report</Badge>
                                )}
                              </div>
                              <p className="font-medium">{affaire.parties}</p>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {new Date(affaire.date).toLocaleDateString('fr-FR', { 
                                    weekday: 'long', 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                  })}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {affaire.heure}
                                </span>
                                <span>📍 {affaire.salle}</span>
                                {juge && <span>⚖️ Juge: {juge.prenom} {juge.nom}</span>}
                              </div>
                              {dossier && (
                                <p className="text-sm text-muted-foreground">
                                  📁 Dossier: {dossier.titre} • {dossier.pieces.length} pièce(s)
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedDossier({ ...affaire, dossier });
                                  setDetailsOpen(true);
                                }}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                Détails
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dossiers">
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Dossiers suivis par le Parquet
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dossierParquet.map((dossier) => (
                    <motion.div
                      key={dossier.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-4 rounded-lg border bg-card hover:shadow-md transition-smooth"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-primary">{dossier.numero}</span>
                            <Badge variant={dossier.statut === "en_cours" ? "default" : "secondary"}>
                              {dossier.statut === "en_cours" ? "En cours" : dossier.statut === "archive" ? "Archivé" : "Clos"}
                            </Badge>
                          </div>
                          <p className="font-medium">{dossier.titre}</p>
                          <p className="text-sm text-muted-foreground">{dossier.description}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>📎 {dossier.pieces.length} pièce(s)</span>
                            <span>📅 Créé le {new Date(dossier.dateCreation).toLocaleDateString('fr-FR')}</span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          Voir
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialog détails */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-primary" />
                Détails de l'affaire {selectedDossier?.numero}
              </DialogTitle>
            </DialogHeader>
            {selectedDossier && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Parties</p>
                    <p className="font-medium">{selectedDossier.parties}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Statut</p>
                    <Badge className={getStatutBadge(selectedDossier.statut).bg + " " + getStatutBadge(selectedDossier.statut).text}>
                      {getStatutBadge(selectedDossier.statut).label}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date et heure</p>
                    <p className="font-medium">{new Date(selectedDossier.date).toLocaleDateString('fr-FR')} à {selectedDossier.heure}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Salle</p>
                    <p className="font-medium">{selectedDossier.salle}</p>
                  </div>
                </div>
                
                {selectedDossier.dossier && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Dossier associé</h4>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <p className="font-medium">{selectedDossier.dossier.titre}</p>
                      <p className="text-sm text-muted-foreground">{selectedDossier.dossier.description}</p>
                      <div className="mt-2">
                        <p className="text-sm font-medium">Pièces jointes ({selectedDossier.dossier.pieces.length})</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {selectedDossier.dossier.pieces.map((piece: any, idx: number) => (
                            <Badge key={idx} variant="outline">{piece.nom}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedDossier.observations && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Observations</h4>
                    <p className="text-sm">{selectedDossier.observations}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default ProcureurAffaires;