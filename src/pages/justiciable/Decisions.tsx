import { useState } from "react";
import { motion } from "framer-motion";
import { Gavel, Calendar, Download, Eye, FileText, CheckCircle, XCircle, AlertCircle, Search, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useApp } from "@/contexts/AppContext";
import DashboardLayout from "@/components/DashboardLayout";

const JusticiableDecisions = () => {
  const { dossiers, currentUser, users } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  // Dossiers où le justiciable est impliqué
  const mesDossiers = dossiers.filter(d => 
    d.accessList.includes(currentUser?.id || "")
  );

  // Simuler des décisions rendues pour les dossiers clôturés ou archivés
  const mesDecisions = mesDossiers
    .filter(d => d.statut === "clos" || d.statut === "archive")
    .map(dossier => ({
      id: `decision-${dossier.id}`,
      dossierId: dossier.id,
      dossierNumero: dossier.numero,
      dossierTitre: dossier.titre,
      type: "Jugement",
      dateDecision: new Date(new Date(dossier.dateCreation).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      resultat: Math.random() > 0.3 ? "favorable" : Math.random() > 0.5 ? "defavorable" : "partiel",
      dispositif: "Le tribunal, après avoir délibéré conformément à la loi, statuant publiquement, contradictoirement et en premier ressort...",
      motifs: "Attendu que les faits sont établis et que les preuves sont suffisantes..."
    }));

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.nom || "Non assigné";
  };

  const getResultatBadge = (resultat: string) => {
    switch (resultat) {
      case "favorable":
        return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="w-3 h-3 mr-1" /> Favorable</Badge>;
      case "defavorable":
        return <Badge className="bg-red-500 hover:bg-red-600"><XCircle className="w-3 h-3 mr-1" /> Défavorable</Badge>;
      case "partiel":
        return <Badge className="bg-amber-500 hover:bg-amber-600"><AlertCircle className="w-3 h-3 mr-1" /> Partiel</Badge>;
      default:
        return <Badge variant="outline">{resultat}</Badge>;
    }
  };

  const filteredDecisions = mesDecisions.filter(decision => {
    const matchesSearch = 
      decision.dossierNumero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      decision.dossierTitre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || decision.resultat === typeFilter;
    return matchesSearch && matchesType;
  });

  const stats = {
    total: mesDecisions.length,
    favorables: mesDecisions.filter(d => d.resultat === "favorable").length,
    defavorables: mesDecisions.filter(d => d.resultat === "defavorable").length,
    partiels: mesDecisions.filter(d => d.resultat === "partiel").length
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-primary">Décisions Rendues</h1>
            <p className="text-muted-foreground mt-1">Consultez les décisions de justice concernant votre affaire</p>
          </div>
        </motion.div>

        {/* Statistiques */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <Card className="shadow-elegant">
            <CardContent className="p-4 text-center">
              <Gavel className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total décisions</div>
            </CardContent>
          </Card>
          <Card className="shadow-elegant border-green-200">
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">{stats.favorables}</div>
              <div className="text-sm text-muted-foreground">Favorables</div>
            </CardContent>
          </Card>
          <Card className="shadow-elegant border-red-200">
            <CardContent className="p-4 text-center">
              <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-600">{stats.defavorables}</div>
              <div className="text-sm text-muted-foreground">Défavorables</div>
            </CardContent>
          </Card>
          <Card className="shadow-elegant border-amber-200">
            <CardContent className="p-4 text-center">
              <AlertCircle className="w-8 h-8 text-amber-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-amber-600">{stats.partiels}</div>
              <div className="text-sm text-muted-foreground">Partiels</div>
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
                    placeholder="Rechercher une décision..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filtrer par résultat" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les résultats</SelectItem>
                    <SelectItem value="favorable">Favorables</SelectItem>
                    <SelectItem value="defavorable">Défavorables</SelectItem>
                    <SelectItem value="partiel">Partiels</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Liste des décisions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gavel className="w-5 h-5 text-primary" />
                Mes Décisions ({filteredDecisions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredDecisions.length === 0 ? (
                <div className="text-center py-12">
                  <Gavel className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Aucune décision n'a encore été rendue pour votre affaire</p>
                  <p className="text-sm text-muted-foreground mt-2">Vous serez notifié dès qu'une décision sera publiée</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredDecisions.map((decision, index) => (
                    <motion.div
                      key={decision.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 rounded-lg border bg-card hover:shadow-md transition-all"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-lg bg-primary/10">
                            <Gavel className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{decision.type}</h3>
                            <p className="text-sm text-muted-foreground">{decision.dossierNumero} - {decision.dossierTitre}</p>
                            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
                              <span className="flex items-center gap-1 text-muted-foreground">
                                <Calendar className="w-4 h-4" />
                                {new Date(decision.dateDecision).toLocaleDateString('fr-FR', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getResultatBadge(decision.resultat)}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4 mr-2" />
                                Voir
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <Gavel className="w-5 h-5 text-primary" />
                                  {decision.type}
                                </DialogTitle>
                              </DialogHeader>
                              <div className="space-y-6 mt-4">
                                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                                  <div>
                                    <p className="font-medium">{decision.dossierNumero}</p>
                                    <p className="text-sm text-muted-foreground">{decision.dossierTitre}</p>
                                  </div>
                                  {getResultatBadge(decision.resultat)}
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-2">Informations</h4>
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="text-muted-foreground">Date de la décision:</span>
                                      <p className="font-medium">{new Date(decision.dateDecision).toLocaleDateString('fr-FR')}</p>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-2">Motifs</h4>
                                  <p className="text-sm text-muted-foreground bg-muted/30 p-4 rounded-lg">
                                    {decision.motifs}
                                  </p>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-2">Dispositif</h4>
                                  <p className="text-sm text-muted-foreground bg-muted/30 p-4 rounded-lg">
                                    {decision.dispositif}
                                  </p>
                                </div>
                                <div className="flex gap-2 pt-4 border-t">
                                  <Button className="flex-1">
                                    <Download className="w-4 h-4 mr-2" />
                                    Télécharger PDF
                                  </Button>
                                  <Button variant="outline" className="flex-1">
                                    <FileText className="w-4 h-4 mr-2" />
                                    Imprimer
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button variant="ghost" size="icon">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Information importante */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="shadow-elegant border-blue-200 bg-blue-50/50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-800">Besoin d'aide pour comprendre votre décision ?</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Si vous ne comprenez pas les termes juridiques ou le contenu de la décision, n'hésitez pas à consulter un avocat 
                    ou à vous rendre au greffe du tribunal pour des explications.
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

export default JusticiableDecisions;
