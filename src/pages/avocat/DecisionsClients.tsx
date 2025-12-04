import { useState } from "react";
import { motion } from "framer-motion";
import { Scale, Search, Filter, Eye, Download, Calendar, User, FileText, CheckCircle, XCircle, Clock, Printer, Share2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/DashboardLayout";

// Données mock pour les décisions
const mockDecisions = [
  {
    id: "dec-1",
    numero: "DEC-2024-001",
    audienceId: "aud-1",
    audienceNumero: "AUD-2024-001",
    type: "Jugement",
    dateRendu: "2024-01-15",
    jugeId: "user-juge-1",
    jugeName: "Mamadou Diop",
    statut: "publiee",
    dispositif: "Le tribunal, après en avoir délibéré conformément à la loi, statuant publiquement, contradictoirement et en premier ressort : CONDAMNE le défendeur au paiement de la somme de 5 000 000 FCFA à titre de dommages et intérêts...",
    parties: "Société ABC c/ Entreprise XYZ",
    client: "Société ABC",
    resultat: "favorable"
  },
  {
    id: "dec-2",
    numero: "DEC-2024-002",
    audienceId: "aud-2",
    audienceNumero: "AUD-2024-002",
    type: "Ordonnance",
    dateRendu: "2024-01-20",
    jugeId: "user-juge-2",
    jugeName: "Fatou Sall",
    statut: "publiee",
    dispositif: "Vu l'urgence, ordonnons la suspension des mesures d'expulsion jusqu'à ce qu'il soit statué au fond...",
    parties: "M. Ibrahima Ndiaye c/ Bailleur",
    client: "M. Ibrahima Ndiaye",
    resultat: "favorable"
  },
  {
    id: "dec-3",
    numero: "DEC-2024-003",
    audienceId: "aud-3",
    audienceNumero: "AUD-2024-003",
    type: "Jugement",
    dateRendu: "2024-02-05",
    jugeId: "user-juge-1",
    jugeName: "Mamadou Diop",
    statut: "publiee",
    dispositif: "DÉBOUTE le demandeur de l'ensemble de ses demandes. CONDAMNE le demandeur aux dépens...",
    parties: "Mme Aminata Fall c/ Assurance Santé",
    client: "Mme Aminata Fall",
    resultat: "defavorable"
  },
  {
    id: "dec-4",
    numero: "DEC-2024-004",
    audienceId: "aud-4",
    audienceNumero: "AUD-2024-004",
    type: "Arrêt",
    dateRendu: "2024-02-15",
    jugeId: "user-juge-3",
    jugeName: "Ousmane Ba",
    statut: "publiee",
    dispositif: "LA COUR, statuant en appel : CONFIRME le jugement entrepris en toutes ses dispositions...",
    parties: "SARL Commerce Plus c/ État du Sénégal",
    client: "SARL Commerce Plus",
    resultat: "partiel"
  }
];

const AvocatDecisionsClients = () => {
  const { currentUser, users } = useApp();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [resultatFilter, setResultatFilter] = useState("all");
  const [selectedDecision, setSelectedDecision] = useState<any>(null);

  const getResultatBadge = (resultat: string) => {
    const styles: Record<string, { style: string; label: string; icon: any }> = {
      favorable: { style: "bg-green-100 text-green-700 border-green-200", label: "Favorable", icon: CheckCircle },
      defavorable: { style: "bg-red-100 text-red-700 border-red-200", label: "Défavorable", icon: XCircle },
      partiel: { style: "bg-amber-100 text-amber-700 border-amber-200", label: "Partiellement favorable", icon: Clock }
    };
    return styles[resultat] || styles.partiel;
  };

  const filteredDecisions = mockDecisions.filter(decision => {
    const matchesSearch = decision.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      decision.parties.toLowerCase().includes(searchTerm.toLowerCase()) ||
      decision.client.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || decision.type === typeFilter;
    const matchesResultat = resultatFilter === "all" || decision.resultat === resultatFilter;
    return matchesSearch && matchesType && matchesResultat;
  });

  const stats = {
    total: mockDecisions.length,
    favorables: mockDecisions.filter(d => d.resultat === "favorable").length,
    defavorables: mockDecisions.filter(d => d.resultat === "defavorable").length,
    partiels: mockDecisions.filter(d => d.resultat === "partiel").length
  };

  const handleDownload = (decision: any) => {
    toast({
      title: "Téléchargement",
      description: `La décision ${decision.numero} est en cours de téléchargement...`
    });
  };

  const handleShare = (decision: any) => {
    toast({
      title: "Partage",
      description: `Lien de partage de la décision ${decision.numero} copié !`
    });
  };

  const handlePrint = (decision: any) => {
    toast({
      title: "Impression",
      description: `Préparation de l'impression de la décision ${decision.numero}...`
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-primary">Décisions de mes Clients</h1>
          <p className="text-muted-foreground mt-1">Consultez et archivez toutes les décisions rendues concernant vos clients</p>
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
              <Scale className="w-8 h-8 text-primary mx-auto mb-2" />
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
              <Clock className="w-8 h-8 text-amber-600 mx-auto mb-2" />
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
                    placeholder="Rechercher par numéro, parties ou client..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="Jugement">Jugement</SelectItem>
                    <SelectItem value="Ordonnance">Ordonnance</SelectItem>
                    <SelectItem value="Arrêt">Arrêt</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={resultatFilter} onValueChange={setResultatFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <Scale className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Résultat" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les résultats</SelectItem>
                    <SelectItem value="favorable">Favorable</SelectItem>
                    <SelectItem value="defavorable">Défavorable</SelectItem>
                    <SelectItem value="partiel">Partiel</SelectItem>
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
                <Scale className="w-5 h-5 text-primary" />
                Décisions rendues ({filteredDecisions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredDecisions.length === 0 ? (
                <div className="text-center py-12">
                  <Scale className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Aucune décision trouvée</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredDecisions.map((decision, index) => {
                    const resultatBadge = getResultatBadge(decision.resultat);
                    const ResultatIcon = resultatBadge.icon;

                    return (
                      <motion.div
                        key={decision.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4 rounded-lg border bg-card hover:shadow-md transition-all"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-primary">{decision.numero}</span>
                              <Badge variant="outline">{decision.type}</Badge>
                              <Badge className={resultatBadge.style}>
                                <ResultatIcon className="w-3 h-3 mr-1" />
                                {resultatBadge.label}
                              </Badge>
                            </div>
                            <p className="font-medium">{decision.parties}</p>
                            <p className="text-sm text-muted-foreground">Client: {decision.client}</p>
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                Rendu le {new Date(decision.dateRendu).toLocaleDateString('fr-FR')}
                              </span>
                              <span className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                Juge: {decision.jugeName}
                              </span>
                              <span className="flex items-center gap-1">
                                <FileText className="w-4 h-4" />
                                {decision.audienceNumero}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleDownload(decision)}>
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleShare(decision)}>
                              <Share2 className="w-4 h-4" />
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" onClick={() => setSelectedDecision(decision)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Consulter
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-2">
                                    <Scale className="w-5 h-5" />
                                    Décision {decision.numero}
                                  </DialogTitle>
                                </DialogHeader>
                                <Tabs defaultValue="decision" className="mt-4">
                                  <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="decision">Décision</TabsTrigger>
                                    <TabsTrigger value="details">Détails</TabsTrigger>
                                  </TabsList>
                                  <TabsContent value="decision" className="space-y-4 mt-4">
                                    <div className="flex items-center gap-2 mb-4">
                                      <Badge variant="outline">{decision.type}</Badge>
                                      <Badge className={resultatBadge.style}>
                                        <ResultatIcon className="w-3 h-3 mr-1" />
                                        {resultatBadge.label}
                                      </Badge>
                                    </div>
                                    <div className="p-4 rounded-lg bg-muted/50">
                                      <h4 className="font-semibold mb-2">Dispositif</h4>
                                      <p className="text-sm leading-relaxed">{decision.dispositif}</p>
                                    </div>
                                  </TabsContent>
                                  <TabsContent value="details" className="space-y-4 mt-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="p-3 rounded-lg bg-muted/50">
                                        <p className="text-sm text-muted-foreground">Numéro</p>
                                        <p className="font-medium">{decision.numero}</p>
                                      </div>
                                      <div className="p-3 rounded-lg bg-muted/50">
                                        <p className="text-sm text-muted-foreground">Audience</p>
                                        <p className="font-medium">{decision.audienceNumero}</p>
                                      </div>
                                      <div className="p-3 rounded-lg bg-muted/50">
                                        <p className="text-sm text-muted-foreground">Date du rendu</p>
                                        <p className="font-medium">{new Date(decision.dateRendu).toLocaleDateString('fr-FR')}</p>
                                      </div>
                                      <div className="p-3 rounded-lg bg-muted/50">
                                        <p className="text-sm text-muted-foreground">Juge</p>
                                        <p className="font-medium">{decision.jugeName}</p>
                                      </div>
                                      <div className="p-3 rounded-lg bg-muted/50 col-span-2">
                                        <p className="text-sm text-muted-foreground">Parties</p>
                                        <p className="font-medium">{decision.parties}</p>
                                      </div>
                                      <div className="p-3 rounded-lg bg-muted/50 col-span-2">
                                        <p className="text-sm text-muted-foreground">Client représenté</p>
                                        <p className="font-medium">{decision.client}</p>
                                      </div>
                                    </div>
                                  </TabsContent>
                                </Tabs>
                                <DialogFooter className="mt-4">
                                  <Button variant="outline" onClick={() => handlePrint(decision)}>
                                    <Printer className="w-4 h-4 mr-2" />
                                    Imprimer
                                  </Button>
                                  <Button onClick={() => handleDownload(decision)}>
                                    <Download className="w-4 h-4 mr-2" />
                                    Télécharger PDF
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
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

export default AvocatDecisionsClients;
