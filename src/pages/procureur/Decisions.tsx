import { useState } from "react";
import { motion } from "framer-motion";
import { Scale, Search, Filter, FileText, Calendar, User, Eye, Download, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApp } from "@/contexts/AppContext";
import DashboardLayout from "@/components/DashboardLayout";

const ProcureurDecisions = () => {
  const { audiences, users } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedDecision, setSelectedDecision] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Simuler des décisions rendues (dans un vrai système, cela viendrait d'une table dédiée)
  const decisionsRendues = [
    {
      id: "dec-1",
      numero: "DEC-2024-001",
      audienceId: "aud-1",
      audienceNumero: "AUD-2024-001",
      parties: "État du Sénégal c/ DIALLO Mamadou",
      type: "condamnation",
      resume: "Condamnation à 2 ans d'emprisonnement avec sursis pour escroquerie aggravée. Le tribunal a retenu les circonstances atténuantes liées à la situation familiale du prévenu.",
      jugeId: "juge-1",
      dateRendu: "2024-01-20",
      datePublication: "2024-01-22",
      statut: "publiee",
      motivations: "Attendu que les faits sont établis par les preuves matérielles et les témoignages...",
      dispositif: "Le tribunal condamne M. DIALLO à 2 ans d'emprisonnement avec sursis..."
    },
    {
      id: "dec-2",
      numero: "DEC-2024-002",
      audienceId: "aud-2",
      audienceNumero: "AUD-2024-003",
      parties: "État du Sénégal c/ SECK Ibrahima",
      type: "relaxe",
      resume: "Relaxe prononcée pour insuffisance de preuves. Le ministère public n'a pas pu établir la culpabilité au-delà du doute raisonnable.",
      jugeId: "juge-1",
      dateRendu: "2024-01-25",
      datePublication: "2024-01-27",
      statut: "publiee",
      motivations: "Attendu que les éléments de preuve présentés ne permettent pas d'établir avec certitude...",
      dispositif: "Le tribunal prononce la relaxe de M. SECK..."
    },
    {
      id: "dec-3",
      numero: "DEC-2024-003",
      audienceId: "aud-3",
      audienceNumero: "AUD-2024-004",
      parties: "État du Sénégal c/ NDIAYE Fatou",
      type: "renvoi",
      resume: "Renvoi pour complément d'information. Expertise médicale ordonnée pour évaluer la responsabilité pénale.",
      jugeId: "juge-1",
      dateRendu: "2024-02-01",
      datePublication: null,
      statut: "en_attente",
      motivations: "Attendu que l'état de santé mentale de la prévenue nécessite une expertise...",
      dispositif: "Le tribunal ordonne une expertise psychiatrique..."
    },
    {
      id: "dec-4",
      numero: "DEC-2024-004",
      audienceId: "aud-4",
      audienceNumero: "AUD-2024-005",
      parties: "État du Sénégal c/ FALL Ousmane",
      type: "condamnation",
      resume: "Condamnation à 5 ans d'emprisonnement ferme pour vol avec violence. Application de la récidive légale.",
      jugeId: "juge-1",
      dateRendu: "2024-02-10",
      datePublication: "2024-02-12",
      statut: "publiee",
      motivations: "Attendu que le prévenu a déjà été condamné pour des faits similaires...",
      dispositif: "Le tribunal condamne M. FALL à 5 ans d'emprisonnement ferme..."
    }
  ];

  // Filtres
  const filteredDecisions = decisionsRendues.filter(decision => {
    const matchSearch = 
      decision.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      decision.parties.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = typeFilter === "all" || decision.type === typeFilter;
    return matchSearch && matchType;
  });

  const getTypeBadge = (type: string) => {
    const types: Record<string, { bg: string; text: string; label: string }> = {
      condamnation: { bg: "bg-red-100", text: "text-red-700", label: "Condamnation" },
      relaxe: { bg: "bg-green-100", text: "text-green-700", label: "Relaxe" },
      renvoi: { bg: "bg-amber-100", text: "text-amber-700", label: "Renvoi" },
      sursis: { bg: "bg-blue-100", text: "text-blue-700", label: "Sursis" }
    };
    return types[type] || types.condamnation;
  };

  const getStatutBadge = (statut: string) => {
    return statut === "publiee" 
      ? { bg: "bg-green-100", text: "text-green-700", label: "Publiée", icon: CheckCircle }
      : { bg: "bg-amber-100", text: "text-amber-700", label: "En attente", icon: Clock };
  };

  // Statistiques
  const stats = {
    total: decisionsRendues.length,
    condamnations: decisionsRendues.filter(d => d.type === "condamnation").length,
    relaxes: decisionsRendues.filter(d => d.type === "relaxe").length,
    renvois: decisionsRendues.filter(d => d.type === "renvoi").length,
    publiees: decisionsRendues.filter(d => d.statut === "publiee").length
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
            <Scale className="w-8 h-8" />
            Décisions de Justice
          </h1>
          <p className="text-muted-foreground mt-1">Consultation et suivi des décisions rendues par les juges</p>
        </motion.div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="shadow-elegant">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-primary">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total décisions</p>
            </CardContent>
          </Card>
          <Card className="shadow-elegant">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-red-600">{stats.condamnations}</p>
              <p className="text-sm text-muted-foreground">Condamnations</p>
            </CardContent>
          </Card>
          <Card className="shadow-elegant">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-green-600">{stats.relaxes}</p>
              <p className="text-sm text-muted-foreground">Relaxes</p>
            </CardContent>
          </Card>
          <Card className="shadow-elegant">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-amber-600">{stats.renvois}</p>
              <p className="text-sm text-muted-foreground">Renvois</p>
            </CardContent>
          </Card>
          <Card className="shadow-elegant">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-blue-600">{stats.publiees}</p>
              <p className="text-sm text-muted-foreground">Publiées</p>
            </CardContent>
          </Card>
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
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Type de décision" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="condamnation">Condamnation</SelectItem>
                  <SelectItem value="relaxe">Relaxe</SelectItem>
                  <SelectItem value="renvoi">Renvoi</SelectItem>
                  <SelectItem value="sursis">Sursis</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Liste des décisions */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Décisions rendues ({filteredDecisions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredDecisions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Aucune décision trouvée</p>
            ) : (
              <div className="space-y-4">
                {filteredDecisions.map((decision) => {
                  const typeBadge = getTypeBadge(decision.type);
                  const statutBadge = getStatutBadge(decision.statut);
                  const juge = users.find(u => u.id === decision.jugeId);
                  const StatusIcon = statutBadge.icon;

                  return (
                    <motion.div
                      key={decision.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-4 rounded-lg border bg-card hover:shadow-md transition-smooth"
                    >
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-primary text-lg">{decision.numero}</span>
                            <Badge className={`${typeBadge.bg} ${typeBadge.text}`}>{typeBadge.label}</Badge>
                            <Badge className={`${statutBadge.bg} ${statutBadge.text} flex items-center gap-1`}>
                              <StatusIcon className="w-3 h-3" />
                              {statutBadge.label}
                            </Badge>
                          </div>
                          <p className="font-medium">{decision.parties}</p>
                          <p className="text-sm text-muted-foreground line-clamp-2">{decision.resume}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              Rendu le {new Date(decision.dateRendu).toLocaleDateString('fr-FR')}
                            </span>
                            {juge && (
                              <span className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                Juge: {juge.prenom} {juge.nom}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <FileText className="w-4 h-4" />
                              Audience: {decision.audienceNumero}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedDecision(decision);
                              setDetailsOpen(true);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Voir
                          </Button>
                          {decision.statut === "publiee" && (
                            <Button variant="outline" size="sm">
                              <Download className="w-4 h-4 mr-1" />
                              PDF
                            </Button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Analyse des résultats */}
        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              Analyse des poursuites
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-700">
                  {Math.round((stats.condamnations / stats.total) * 100)}%
                </p>
                <p className="text-sm text-green-600">Taux de condamnation</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-red-700">
                  {Math.round((stats.relaxes / stats.total) * 100)}%
                </p>
                <p className="text-sm text-red-600">Taux de relaxe</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-amber-700">
                  {Math.round((stats.renvois / stats.total) * 100)}%
                </p>
                <p className="text-sm text-amber-600">Taux de renvoi</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dialog détails décision */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-primary" />
                Décision {selectedDecision?.numero}
              </DialogTitle>
            </DialogHeader>
            {selectedDecision && (
              <Tabs defaultValue="resume" className="space-y-4">
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="resume">Résumé</TabsTrigger>
                  <TabsTrigger value="motivations">Motivations</TabsTrigger>
                  <TabsTrigger value="dispositif">Dispositif</TabsTrigger>
                </TabsList>

                <TabsContent value="resume" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Parties</p>
                      <p className="font-medium">{selectedDecision.parties}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Type</p>
                      <Badge className={`${getTypeBadge(selectedDecision.type).bg} ${getTypeBadge(selectedDecision.type).text}`}>
                        {getTypeBadge(selectedDecision.type).label}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Date de rendu</p>
                      <p className="font-medium">{new Date(selectedDecision.dateRendu).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Audience</p>
                      <p className="font-medium">{selectedDecision.audienceNumero}</p>
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Résumé de la décision</h4>
                    <p className="text-sm">{selectedDecision.resume}</p>
                  </div>
                </TabsContent>

                <TabsContent value="motivations">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Motivations</h4>
                    <p className="text-sm whitespace-pre-wrap">{selectedDecision.motivations}</p>
                  </div>
                </TabsContent>

                <TabsContent value="dispositif">
                  <div className="bg-primary/5 p-4 rounded-lg border-l-4 border-primary">
                    <h4 className="font-semibold mb-2">Dispositif</h4>
                    <p className="text-sm whitespace-pre-wrap">{selectedDecision.dispositif}</p>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default ProcureurDecisions;