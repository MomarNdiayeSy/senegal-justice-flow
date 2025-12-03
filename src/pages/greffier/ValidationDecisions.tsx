import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Clock, Eye, Scale, FileText, User, Calendar, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/DashboardLayout";

interface Decision {
  id: string;
  numero: string;
  titre: string;
  contenu: string;
  type: "jugement" | "ordonnance" | "arret" | "decision";
  statut: "en_validation" | "validee" | "rejetee" | "publiee";
  dateCreation: string;
  dateValidation?: string;
  jugeId: string;
  jugeNom: string;
  parties: string;
  commentaireValidation?: string;
}

const ValidationDecisions = () => {
  const { users, currentUser, addNotification, addLog } = useApp();
  const { toast } = useToast();
  const [viewingDecision, setViewingDecision] = useState<Decision | null>(null);
  const [validationComment, setValidationComment] = useState("");

  const [decisions, setDecisions] = useState<Decision[]>([
    {
      id: "1",
      numero: "DEC-2025-002",
      titre: "Ordonnance de report",
      contenu: "Le Tribunal ordonne le report de l'audience au motif que l'avocat de la défense est indisponible...\n\nFait à Dakar, le 20 janvier 2025.",
      type: "ordonnance",
      statut: "en_validation",
      dateCreation: "2025-01-20",
      jugeId: "3",
      jugeNom: "Juge Moussa Ba",
      parties: "État du Sénégal vs Fall"
    },
    {
      id: "2",
      numero: "DEC-2025-003",
      titre: "Jugement - Affaire commerciale",
      contenu: "Vu les conclusions des parties...\n\nLe Tribunal condamne le défendeur à payer la somme de 10.000.000 FCFA à titre de dommages et intérêts.\n\nFait à Dakar, le 18 janvier 2025.",
      type: "jugement",
      statut: "en_validation",
      dateCreation: "2025-01-18",
      jugeId: "3",
      jugeNom: "Juge Moussa Ba",
      parties: "SARL Commerce vs Fournisseur XYZ"
    },
    {
      id: "3",
      numero: "DEC-2025-001",
      titre: "Jugement - Affaire Diallo vs Sarr",
      contenu: "Vu les conclusions des parties...\n\nLe Tribunal déboute le demandeur de ses prétentions.\n\nFait à Dakar, le 15 janvier 2025.",
      type: "jugement",
      statut: "validee",
      dateCreation: "2025-01-15",
      dateValidation: "2025-01-16",
      jugeId: "3",
      jugeNom: "Juge Moussa Ba",
      parties: "Diallo vs Sarr"
    }
  ]);

  const decisionsEnAttente = decisions.filter(d => d.statut === "en_validation");
  const decisionsValidees = decisions.filter(d => d.statut === "validee" || d.statut === "publiee");
  const decisionsRejetees = decisions.filter(d => d.statut === "rejetee");

  const getTypeBadge = (type: Decision["type"]) => {
    const config = {
      jugement: { style: "bg-purple-100 text-purple-700", label: "Jugement" },
      ordonnance: { style: "bg-blue-100 text-blue-700", label: "Ordonnance" },
      arret: { style: "bg-indigo-100 text-indigo-700", label: "Arrêt" },
      decision: { style: "bg-teal-100 text-teal-700", label: "Décision" }
    };
    return config[type];
  };

  const getStatutBadge = (statut: Decision["statut"]) => {
    const config = {
      en_validation: { style: "bg-amber-100 text-amber-700", label: "En attente" },
      validee: { style: "bg-green-100 text-green-700", label: "Validée" },
      rejetee: { style: "bg-red-100 text-red-700", label: "Rejetée" },
      publiee: { style: "bg-blue-100 text-blue-700", label: "Publiée" }
    };
    return config[statut];
  };

  const handleValidation = (decision: Decision, action: "valider" | "rejeter") => {
    const newStatut = action === "valider" ? "validee" : "rejetee";
    
    setDecisions(decisions.map(d => 
      d.id === decision.id ? {
        ...d,
        statut: newStatut as Decision["statut"],
        dateValidation: new Date().toISOString(),
        commentaireValidation: validationComment
      } : d
    ));

    // Notify the judge
    addNotification({
      type: "decision_rendue",
      titre: action === "valider" ? "Décision validée" : "Décision rejetée",
      message: `Votre décision ${decision.numero} a été ${action === "valider" ? "validée" : "rejetée"} par le greffe`,
      destinataireId: decision.jugeId,
      statut: "envoye",
      canal: "email",
      tentatives: 1
    });

    addLog({
      userId: currentUser?.id || "",
      action: action === "valider" ? "Validation décision" : "Rejet décision",
      details: `Décision ${decision.numero} ${action === "valider" ? "validée" : "rejetée"}`
    });

    toast({
      title: action === "valider" ? "Décision validée" : "Décision rejetée",
      description: `La décision ${decision.numero} a été ${action === "valider" ? "validée" : "rejetée"}`
    });

    setViewingDecision(null);
    setValidationComment("");
  };

  const handlePublish = (decision: Decision) => {
    setDecisions(decisions.map(d => 
      d.id === decision.id ? { ...d, statut: "publiee" as Decision["statut"] } : d
    ));

    // Notify all parties
    addNotification({
      type: "decision_rendue",
      titre: "Nouvelle décision publiée",
      message: `La décision ${decision.numero} concernant l'affaire "${decision.parties}" a été publiée`,
      destinataireId: decision.jugeId,
      statut: "envoye",
      canal: "email",
      tentatives: 1
    });

    addLog({
      userId: currentUser?.id || "",
      action: "Publication décision",
      details: `Décision ${decision.numero} publiée`
    });

    toast({
      title: "Décision publiée",
      description: "La décision a été publiée et les parties ont été notifiées"
    });
  };

  const DecisionCard = ({ decision, showActions = false }: { decision: Decision; showActions?: boolean }) => {
    const typeBadge = getTypeBadge(decision.type);
    const statutBadge = getStatutBadge(decision.statut);

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
              <Badge className={statutBadge.style}>{statutBadge.label}</Badge>
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
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setViewingDecision(decision)}>
              <Eye className="w-4 h-4 mr-1" />
              Consulter
            </Button>
            {showActions && decision.statut === "en_validation" && (
              <>
                <Button size="sm" variant="default" onClick={() => { setViewingDecision(decision); }}>
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Valider
                </Button>
              </>
            )}
            {decision.statut === "validee" && (
              <Button size="sm" onClick={() => handlePublish(decision)}>
                <Send className="w-4 h-4 mr-1" />
                Publier
              </Button>
            )}
          </div>
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
            <h1 className="text-2xl md:text-3xl font-bold text-primary">Validation des Décisions</h1>
            <p className="text-muted-foreground mt-1">Valider et publier les décisions des magistrats</p>
          </div>
          <Scale className="w-10 h-10 text-primary" />
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-amber-100">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{decisionsEnAttente.length}</p>
                  <p className="text-sm text-muted-foreground">En attente</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-green-100">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{decisionsValidees.length}</p>
                  <p className="text-sm text-muted-foreground">Validées</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-red-100">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{decisionsRejetees.length}</p>
                  <p className="text-sm text-muted-foreground">Rejetées</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="en-attente" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="en-attente">
              En attente ({decisionsEnAttente.length})
            </TabsTrigger>
            <TabsTrigger value="validees">
              Validées ({decisionsValidees.length})
            </TabsTrigger>
            <TabsTrigger value="rejetees">
              Rejetées ({decisionsRejetees.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="en-attente">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-600" />
                  Décisions en attente de validation
                </CardTitle>
              </CardHeader>
              <CardContent>
                {decisionsEnAttente.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Aucune décision en attente</p>
                ) : (
                  <div className="space-y-4">
                    {decisionsEnAttente.map(decision => (
                      <DecisionCard key={decision.id} decision={decision} showActions />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="validees">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Décisions validées
                </CardTitle>
              </CardHeader>
              <CardContent>
                {decisionsValidees.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Aucune décision validée</p>
                ) : (
                  <div className="space-y-4">
                    {decisionsValidees.map(decision => (
                      <DecisionCard key={decision.id} decision={decision} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rejetees">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  Décisions rejetées
                </CardTitle>
              </CardHeader>
              <CardContent>
                {decisionsRejetees.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Aucune décision rejetée</p>
                ) : (
                  <div className="space-y-4">
                    {decisionsRejetees.map(decision => (
                      <DecisionCard key={decision.id} decision={decision} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modal de visualisation et validation */}
        <Dialog open={!!viewingDecision} onOpenChange={() => { setViewingDecision(null); setValidationComment(""); }}>
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
                  <Badge className={getStatutBadge(viewingDecision.statut).style}>
                    {getStatutBadge(viewingDecision.statut).label}
                  </Badge>
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
                    <p className="font-medium">{new Date(viewingDecision.dateCreation).toLocaleDateString("fr-FR")}</p>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Contenu de la décision</h4>
                  <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap text-sm max-h-[200px] overflow-y-auto">
                    {viewingDecision.contenu}
                  </div>
                </div>
                
                {viewingDecision.statut === "en_validation" && (
                  <div className="border-t pt-4 space-y-4">
                    <div>
                      <Label>Commentaire de validation (optionnel)</Label>
                      <Textarea
                        value={validationComment}
                        onChange={(e) => setValidationComment(e.target.value)}
                        placeholder="Ajoutez un commentaire..."
                        rows={3}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="destructive"
                        onClick={() => handleValidation(viewingDecision, "rejeter")}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Rejeter
                      </Button>
                      <Button onClick={() => handleValidation(viewingDecision, "valider")}>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Valider
                      </Button>
                    </div>
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

export default ValidationDecisions;
