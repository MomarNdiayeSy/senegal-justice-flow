import { useState } from "react";
import { motion } from "framer-motion";
import { History, Search, Filter, Calendar, User, Scale, FileText, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApp } from "@/contexts/AppContext";
import DashboardLayout from "@/components/DashboardLayout";

interface Decision {
  id: string;
  numero: string;
  titre: string;
  contenu: string;
  type: "jugement" | "ordonnance" | "arret" | "decision";
  dateCreation: string;
  jugeId: string;
  jugeNom: string;
  parties: string;
  matiere: string;
}

const DecisionHistory = () => {
  const { currentUser, users } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("__all__");
  const [filterMatiere, setFilterMatiere] = useState("__all__");
  const [viewingDecision, setViewingDecision] = useState<Decision | null>(null);

  // Mock historique de décisions (mes décisions + celles des collègues)
  const allDecisions: Decision[] = [
    {
      id: "1",
      numero: "DEC-2025-001",
      titre: "Jugement - Affaire Diallo vs Sarr",
      contenu: "Vu les conclusions des parties...\n\nLe Tribunal condamne le défendeur aux dépens et ordonne le paiement de la somme de 5.000.000 FCFA à titre de dommages et intérêts.",
      type: "jugement",
      dateCreation: "2025-01-15",
      jugeId: "3",
      jugeNom: "Juge Moussa Ba",
      parties: "Diallo vs Sarr",
      matiere: "Commercial"
    },
    {
      id: "2",
      numero: "DEC-2024-156",
      titre: "Ordonnance de référé",
      contenu: "Vu l'urgence de la situation...\n\nLe juge des référés ordonne la suspension immédiate des travaux contestés.",
      type: "ordonnance",
      dateCreation: "2024-12-20",
      jugeId: "3",
      jugeNom: "Juge Moussa Ba",
      parties: "SCI Horizon vs Entreprise BTP",
      matiere: "Civil"
    },
    {
      id: "3",
      numero: "DEC-2024-145",
      titre: "Jugement - Affaire de divorce",
      contenu: "Le Tribunal prononce le divorce aux torts partagés...",
      type: "jugement",
      dateCreation: "2024-11-10",
      jugeId: "7",
      jugeNom: "Juge Aminata Diop",
      parties: "Mme Ndiaye vs M. Ndiaye",
      matiere: "Famille"
    },
    {
      id: "4",
      numero: "DEC-2024-132",
      titre: "Arrêt - Contentieux fiscal",
      contenu: "La Cour confirme la décision du tribunal administratif...",
      type: "arret",
      dateCreation: "2024-10-05",
      jugeId: "8",
      jugeNom: "Juge Ousmane Seck",
      parties: "SARL Tech vs DGID",
      matiere: "Fiscal"
    },
    {
      id: "5",
      numero: "DEC-2024-120",
      titre: "Jugement pénal - Vol aggravé",
      contenu: "Le Tribunal déclare le prévenu coupable des faits qui lui sont reprochés...",
      type: "jugement",
      dateCreation: "2024-09-15",
      jugeId: "7",
      jugeNom: "Juge Aminata Diop",
      parties: "Ministère Public vs Dieng",
      matiere: "Pénal"
    }
  ];

  const mesDecisions = allDecisions.filter(d => d.jugeId === currentUser?.id);
  const decisionsCollegues = allDecisions.filter(d => d.jugeId !== currentUser?.id);

  const getTypeBadge = (type: Decision["type"]) => {
    const config = {
      jugement: { style: "bg-purple-100 text-purple-700", label: "Jugement" },
      ordonnance: { style: "bg-blue-100 text-blue-700", label: "Ordonnance" },
      arret: { style: "bg-indigo-100 text-indigo-700", label: "Arrêt" },
      decision: { style: "bg-teal-100 text-teal-700", label: "Décision" }
    };
    return config[type];
  };

  const filterDecisions = (decisions: Decision[]) => {
    return decisions.filter(d => {
      const matchSearch = searchTerm === "" || 
        d.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.parties.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = filterType === "__all__" || d.type === filterType;
      const matchMatiere = filterMatiere === "__all__" || d.matiere === filterMatiere;
      return matchSearch && matchType && matchMatiere;
    });
  };

  const DecisionCard = ({ decision }: { decision: Decision }) => {
    const typeBadge = getTypeBadge(decision.type);
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-4 rounded-lg border bg-card hover:shadow-md transition-all"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-primary">{decision.numero}</span>
              <Badge className={typeBadge.style}>{typeBadge.label}</Badge>
              <Badge variant="outline">{decision.matiere}</Badge>
            </div>
            <p className="font-medium">{decision.titre}</p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {decision.parties}
              </span>
              <span className="flex items-center gap-1">
                <Scale className="w-4 h-4" />
                {decision.jugeNom}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(decision.dateCreation).toLocaleDateString("fr-FR")}
              </span>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setViewingDecision(decision)}
          >
            <Eye className="w-4 h-4 mr-1" />
            Consulter
          </Button>
        </div>
      </motion.div>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-primary">Historique des Décisions</h1>
            <p className="text-muted-foreground mt-1">Consultez vos décisions et celles de vos collègues</p>
          </div>
          <History className="w-10 h-10 text-primary" />
        </motion.div>

        {/* Filtres */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par numéro, titre ou parties..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Tous les types</SelectItem>
                  <SelectItem value="jugement">Jugement</SelectItem>
                  <SelectItem value="ordonnance">Ordonnance</SelectItem>
                  <SelectItem value="arret">Arrêt</SelectItem>
                  <SelectItem value="decision">Décision</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterMatiere} onValueChange={setFilterMatiere}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Matière" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Toutes matières</SelectItem>
                  <SelectItem value="Civil">Civil</SelectItem>
                  <SelectItem value="Pénal">Pénal</SelectItem>
                  <SelectItem value="Commercial">Commercial</SelectItem>
                  <SelectItem value="Famille">Famille</SelectItem>
                  <SelectItem value="Fiscal">Fiscal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="mes-decisions" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="mes-decisions">
              Mes décisions ({filterDecisions(mesDecisions).length})
            </TabsTrigger>
            <TabsTrigger value="collegues">
              Décisions des collègues ({filterDecisions(decisionsCollegues).length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mes-decisions">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Mon historique de décisions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filterDecisions(mesDecisions).length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Aucune décision trouvée
                  </p>
                ) : (
                  <div className="space-y-4">
                    {filterDecisions(mesDecisions).map(decision => (
                      <DecisionCard key={decision.id} decision={decision} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="collegues">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="w-5 h-5 text-primary" />
                  Décisions des collègues (jurisprudence)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filterDecisions(decisionsCollegues).length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Aucune décision trouvée
                  </p>
                ) : (
                  <div className="space-y-4">
                    {filterDecisions(decisionsCollegues).map(decision => (
                      <DecisionCard key={decision.id} decision={decision} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modal de visualisation */}
        <Dialog open={!!viewingDecision} onOpenChange={() => setViewingDecision(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{viewingDecision?.titre}</DialogTitle>
            </DialogHeader>
            {viewingDecision && (
              <div className="space-y-4 py-4">
                <div className="flex flex-wrap gap-2">
                  <Badge className={getTypeBadge(viewingDecision.type).style}>
                    {getTypeBadge(viewingDecision.type).label}
                  </Badge>
                  <Badge variant="outline">{viewingDecision.matiere}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Numéro:</span>
                    <p className="font-medium">{viewingDecision.numero}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Parties:</span>
                    <p className="font-medium">{viewingDecision.parties}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Magistrat:</span>
                    <p className="font-medium">{viewingDecision.jugeNom}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Date:</span>
                    <p className="font-medium">
                      {new Date(viewingDecision.dateCreation).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Contenu de la décision</h4>
                  <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap text-sm">
                    {viewingDecision.contenu}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default DecisionHistory;
