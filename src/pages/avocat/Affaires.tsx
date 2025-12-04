import { useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, Calendar, Search, Filter, Eye, Clock, MapPin, User, FileText, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApp } from "@/contexts/AppContext";
import DashboardLayout from "@/components/DashboardLayout";

const AvocatAffaires = () => {
  const { audiences, dossiers, currentUser, users } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [statutFilter, setStatutFilter] = useState("all");
  const [selectedAffaire, setSelectedAffaire] = useState<any>(null);

  // Filtrer les audiences de l'avocat
  const mesAudiences = audiences.filter(a => a.avocatIds.includes(currentUser?.id || ""));

  // Filtrer les dossiers accessibles
  const mesDossiers = dossiers.filter(d => d.accessList.includes(currentUser?.id || ""));

  const getStatutBadge = (statut: string) => {
    const styles: Record<string, string> = {
      prevue: "bg-blue-100 text-blue-700 border-blue-200",
      en_cours: "bg-amber-100 text-amber-700 border-amber-200",
      reportee: "bg-orange-100 text-orange-700 border-orange-200",
      terminee: "bg-green-100 text-green-700 border-green-200"
    };
    const labels: Record<string, string> = {
      prevue: "Programmée",
      en_cours: "En cours",
      reportee: "Reportée",
      terminee: "Clôturée"
    };
    return { style: styles[statut] || styles.prevue, label: labels[statut] || "Inconnue" };
  };

  const filteredAudiences = mesAudiences.filter(audience => {
    const matchesSearch = audience.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      audience.parties.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatut = statutFilter === "all" || audience.statut === statutFilter;
    return matchesSearch && matchesStatut;
  });

  const stats = {
    total: mesAudiences.length,
    programmees: mesAudiences.filter(a => a.statut === "prevue").length,
    enCours: mesAudiences.filter(a => a.statut === "en_cours").length,
    reportees: mesAudiences.filter(a => a.statut === "reportee").length,
    cloturees: mesAudiences.filter(a => a.statut === "terminee").length
  };

  const getDossierForAudience = (audienceId: string) => {
    const audience = audiences.find(a => a.id === audienceId);
    if (audience?.dossierId) {
      return dossiers.find(d => d.id === audience.dossierId);
    }
    return null;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-primary">Mes Affaires</h1>
          <p className="text-muted-foreground mt-1">Suivi de toutes vos affaires et audiences</p>
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
              <div className="text-2xl font-bold text-primary">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </CardContent>
          </Card>
          <Card className="shadow-elegant border-blue-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.programmees}</div>
              <div className="text-sm text-muted-foreground">Programmées</div>
            </CardContent>
          </Card>
          <Card className="shadow-elegant border-amber-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-amber-600">{stats.enCours}</div>
              <div className="text-sm text-muted-foreground">En cours</div>
            </CardContent>
          </Card>
          <Card className="shadow-elegant border-orange-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.reportees}</div>
              <div className="text-sm text-muted-foreground">Reportées</div>
            </CardContent>
          </Card>
          <Card className="shadow-elegant border-green-200">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.cloturees}</div>
              <div className="text-sm text-muted-foreground">Clôturées</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filtres */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="shadow-elegant">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par numéro ou parties..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statutFilter} onValueChange={setStatutFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filtrer par statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="prevue">Programmée</SelectItem>
                    <SelectItem value="en_cours">En cours</SelectItem>
                    <SelectItem value="reportee">Reportée</SelectItem>
                    <SelectItem value="terminee">Clôturée</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Liste des affaires */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" />
                Liste des affaires ({filteredAudiences.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredAudiences.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Aucune affaire trouvée</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAudiences.map((audience, index) => {
                    const badge = getStatutBadge(audience.statut);
                    const juge = users.find(u => u.id === audience.jugeId);
                    const dossier = getDossierForAudience(audience.id);

                    return (
                      <motion.div
                        key={audience.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 rounded-lg border bg-card hover:shadow-md transition-all"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-primary">{audience.numero}</span>
                              <Badge className={badge.style}>{badge.label}</Badge>
                            </div>
                            <p className="font-medium">{audience.parties}</p>
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(audience.date).toLocaleDateString('fr-FR')} à {audience.heure}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {audience.salle}
                              </span>
                              <span className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                Juge: {juge?.prenom} {juge?.nom}
                              </span>
                              {dossier && (
                                <span className="flex items-center gap-1">
                                  <FileText className="w-4 h-4" />
                                  {dossier.pieces.length} document(s)
                                </span>
                              )}
                            </div>
                          </div>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" onClick={() => setSelectedAffaire({ audience, dossier })}>
                                <Eye className="w-4 h-4 mr-2" />
                                Détails
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <Briefcase className="w-5 h-5" />
                                  Affaire {audience.numero}
                                </DialogTitle>
                              </DialogHeader>
                              <Tabs defaultValue="details" className="mt-4">
                                <TabsList className="grid w-full grid-cols-3">
                                  <TabsTrigger value="details">Détails</TabsTrigger>
                                  <TabsTrigger value="dossier">Dossier</TabsTrigger>
                                  <TabsTrigger value="historique">Historique</TabsTrigger>
                                </TabsList>
                                <TabsContent value="details" className="space-y-4 mt-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 rounded-lg bg-muted/50">
                                      <p className="text-sm text-muted-foreground">Numéro d'audience</p>
                                      <p className="font-medium">{audience.numero}</p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-muted/50">
                                      <p className="text-sm text-muted-foreground">Statut</p>
                                      <Badge className={badge.style}>{badge.label}</Badge>
                                    </div>
                                    <div className="p-3 rounded-lg bg-muted/50">
                                      <p className="text-sm text-muted-foreground">Date et heure</p>
                                      <p className="font-medium">{new Date(audience.date).toLocaleDateString('fr-FR')} à {audience.heure}</p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-muted/50">
                                      <p className="text-sm text-muted-foreground">Salle</p>
                                      <p className="font-medium">{audience.salle}</p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-muted/50 col-span-2">
                                      <p className="text-sm text-muted-foreground">Parties</p>
                                      <p className="font-medium">{audience.parties}</p>
                                    </div>
                                    <div className="p-3 rounded-lg bg-muted/50 col-span-2">
                                      <p className="text-sm text-muted-foreground">Juge</p>
                                      <p className="font-medium">{juge?.prenom} {juge?.nom}</p>
                                    </div>
                                  </div>
                                </TabsContent>
                                <TabsContent value="dossier" className="space-y-4 mt-4">
                                  {dossier ? (
                                    <>
                                      <div className="p-4 rounded-lg border">
                                        <h4 className="font-semibold mb-2">{dossier.titre}</h4>
                                        <p className="text-sm text-muted-foreground mb-4">{dossier.description}</p>
                                        <div className="flex gap-4 text-sm">
                                          <span>Numéro: {dossier.numero}</span>
                                          <span>Statut: {dossier.statut}</span>
                                        </div>
                                      </div>
                                      <div>
                                        <h4 className="font-semibold mb-3">Documents du dossier ({dossier.pieces.length})</h4>
                                        {dossier.pieces.length === 0 ? (
                                          <p className="text-muted-foreground text-sm">Aucun document dans ce dossier</p>
                                        ) : (
                                          <div className="space-y-2">
                                            {dossier.pieces.map((piece, idx) => (
                                              <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                                <div className="flex items-center gap-3">
                                                  <FileText className="w-4 h-4 text-primary" />
                                                  <div>
                                                    <p className="font-medium text-sm">{piece.nom}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                      {piece.type} • Ajouté le {new Date(piece.dateAjout).toLocaleDateString('fr-FR')}
                                                    </p>
                                                  </div>
                                                </div>
                                                <Button variant="ghost" size="sm">
                                                  <Eye className="w-4 h-4" />
                                                </Button>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    </>
                                  ) : (
                                    <p className="text-muted-foreground text-center py-8">Aucun dossier associé à cette audience</p>
                                  )}
                                </TabsContent>
                                <TabsContent value="historique" className="space-y-4 mt-4">
                                  <div className="space-y-3">
                                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                                      <Clock className="w-4 h-4 text-primary mt-1" />
                                      <div>
                                        <p className="font-medium text-sm">Audience créée</p>
                                        <p className="text-xs text-muted-foreground">
                                          {new Date(audience.date).toLocaleDateString('fr-FR')}
                                        </p>
                                      </div>
                                    </div>
                                    {audience.statut === "reportee" && (
                                      <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-50">
                                        <AlertCircle className="w-4 h-4 text-orange-600 mt-1" />
                                        <div>
                                          <p className="font-medium text-sm text-orange-700">Audience reportée</p>
                                          <p className="text-xs text-orange-600">Motif: Non spécifié</p>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </TabsContent>
                              </Tabs>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default AvocatAffaires;
