import { useState } from "react";
import { motion } from "framer-motion";
import { Scale, Plus, FileText, Calendar, User, CheckCircle, Clock, Eye, Edit, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/DashboardLayout";

interface Decision {
  id: string;
  audienceId: string;
  dossierId: string;
  numero: string;
  titre: string;
  contenu: string;
  type: "jugement" | "ordonnance" | "arret" | "decision";
  statut: "brouillon" | "en_validation" | "validee" | "publiee";
  dateCreation: string;
  dateValidation?: string;
  jugeId: string;
  parties: string;
}

const JugeDecisions = () => {
  const { audiences, dossiers, currentUser, users, addNotification, addLog } = useApp();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewingDecision, setViewingDecision] = useState<Decision | null>(null);
  
  // Mock decisions data
  const [decisions, setDecisions] = useState<Decision[]>([
    {
      id: "1",
      audienceId: "1",
      dossierId: "1",
      numero: "DEC-2025-001",
      titre: "Jugement - Affaire Diallo vs Sarr",
      contenu: "Vu les conclusions des parties, vu les pièces du dossier...\n\nLe Tribunal,\n\nAprès en avoir délibéré conformément à la loi,\n\nCondamne le défendeur aux dépens...",
      type: "jugement",
      statut: "publiee",
      dateCreation: "2025-01-15",
      dateValidation: "2025-01-16",
      jugeId: "3",
      parties: "Diallo vs Sarr"
    },
    {
      id: "2",
      audienceId: "2",
      dossierId: "1",
      numero: "DEC-2025-002",
      titre: "Ordonnance de report",
      contenu: "Le Tribunal ordonne le report de l'audience au...",
      type: "ordonnance",
      statut: "en_validation",
      dateCreation: "2025-01-20",
      jugeId: "3",
      parties: "État du Sénégal vs Fall"
    }
  ]);

  const [formData, setFormData] = useState({
    audienceId: "",
    titre: "",
    contenu: "",
    type: "jugement" as Decision["type"]
  });

  const mesAudiences = audiences.filter(a => a.jugeId === currentUser?.id);
  const mesDecisions = decisions.filter(d => d.jugeId === currentUser?.id);

  const getStatutBadge = (statut: Decision["statut"]) => {
    const config = {
      brouillon: { style: "bg-gray-100 text-gray-700", label: "Brouillon" },
      en_validation: { style: "bg-amber-100 text-amber-700", label: "En validation" },
      validee: { style: "bg-blue-100 text-blue-700", label: "Validée" },
      publiee: { style: "bg-green-100 text-green-700", label: "Publiée" }
    };
    return config[statut];
  };

  const getTypeBadge = (type: Decision["type"]) => {
    const config = {
      jugement: { style: "bg-purple-100 text-purple-700", label: "Jugement" },
      ordonnance: { style: "bg-blue-100 text-blue-700", label: "Ordonnance" },
      arret: { style: "bg-indigo-100 text-indigo-700", label: "Arrêt" },
      decision: { style: "bg-teal-100 text-teal-700", label: "Décision" }
    };
    return config[type];
  };

  const handleSubmit = () => {
    if (!formData.audienceId || !formData.titre || !formData.contenu) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    const audience = audiences.find(a => a.id === formData.audienceId);
    const newDecision: Decision = {
      id: Date.now().toString(),
      audienceId: formData.audienceId,
      dossierId: audience?.dossierId || "",
      numero: `DEC-${new Date().getFullYear()}-${String(decisions.length + 1).padStart(3, "0")}`,
      titre: formData.titre,
      contenu: formData.contenu,
      type: formData.type,
      statut: "brouillon",
      dateCreation: new Date().toISOString(),
      jugeId: currentUser?.id || "",
      parties: audience?.parties || ""
    };

    setDecisions([...decisions, newDecision]);
    
    // Log
    addLog({
      userId: currentUser?.id || "",
      action: "Création décision",
      details: `Décision ${newDecision.numero} créée`
    });

    toast({
      title: "Décision créée",
      description: "La décision a été enregistrée comme brouillon"
    });

    setFormData({ audienceId: "", titre: "", contenu: "", type: "jugement" });
    setIsDialogOpen(false);
  };

  const submitForValidation = (decision: Decision) => {
    setDecisions(decisions.map(d => 
      d.id === decision.id ? { ...d, statut: "en_validation" as const } : d
    ));

    // Notify greffier
    const greffiers = users.filter(u => u.role === "greffier");
    greffiers.forEach(greffier => {
      addNotification({
        type: "decision_rendue",
        titre: "Nouvelle décision à valider",
        message: `La décision ${decision.numero} est en attente de validation`,
        destinataireId: greffier.id,
        statut: "envoye",
        canal: "email",
        tentatives: 1
      });
    });

    toast({
      title: "Envoyé pour validation",
      description: "La décision a été transmise au greffe pour validation"
    });
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
            <h1 className="text-2xl md:text-3xl font-bold text-primary">Mes Décisions</h1>
            <p className="text-muted-foreground mt-1">Rédiger et gérer vos décisions judiciaires</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Nouvelle décision
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Rédiger une décision</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Audience concernée *</Label>
                  <Select value={formData.audienceId} onValueChange={(value) => setFormData({ ...formData, audienceId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une audience" />
                    </SelectTrigger>
                    <SelectContent>
                      {mesAudiences.map(audience => (
                        <SelectItem key={audience.id} value={audience.id}>
                          {audience.numero} - {audience.parties}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Type de décision *</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as Decision["type"] })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jugement">Jugement</SelectItem>
                      <SelectItem value="ordonnance">Ordonnance</SelectItem>
                      <SelectItem value="arret">Arrêt</SelectItem>
                      <SelectItem value="decision">Décision</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Titre *</Label>
                  <Input
                    value={formData.titre}
                    onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                    placeholder="Ex: Jugement - Affaire Diallo vs Sarr"
                  />
                </div>
                <div>
                  <Label>Contenu de la décision *</Label>
                  <Textarea
                    value={formData.contenu}
                    onChange={(e) => setFormData({ ...formData, contenu: e.target.value })}
                    placeholder="Rédigez le contenu de votre décision..."
                    rows={10}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleSubmit}>
                    Enregistrer le brouillon
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-gray-100">
                  <FileText className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{mesDecisions.filter(d => d.statut === "brouillon").length}</p>
                  <p className="text-sm text-muted-foreground">Brouillons</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-amber-100">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{mesDecisions.filter(d => d.statut === "en_validation").length}</p>
                  <p className="text-sm text-muted-foreground">En validation</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-blue-100">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{mesDecisions.filter(d => d.statut === "validee").length}</p>
                  <p className="text-sm text-muted-foreground">Validées</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-green-100">
                  <Scale className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{mesDecisions.filter(d => d.statut === "publiee").length}</p>
                  <p className="text-sm text-muted-foreground">Publiées</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Liste des décisions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-primary" />
              Mes décisions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {mesDecisions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Aucune décision rédigée</p>
            ) : (
              <div className="space-y-4">
                {mesDecisions.map((decision) => {
                  const statutBadge = getStatutBadge(decision.statut);
                  const typeBadge = getTypeBadge(decision.type);
                  return (
                    <motion.div
                      key={decision.id}
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
                              <Calendar className="w-4 h-4" />
                              {new Date(decision.dateCreation).toLocaleDateString("fr-FR")}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setViewingDecision(decision)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {decision.statut === "brouillon" && (
                            <>
                              <Button size="sm" variant="outline">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => submitForValidation(decision)}
                              >
                                <Send className="w-4 h-4 mr-1" />
                                Soumettre
                              </Button>
                            </>
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
                    <span className="text-muted-foreground">Date de création:</span>
                    <p className="font-medium">{new Date(viewingDecision.dateCreation).toLocaleDateString("fr-FR")}</p>
                  </div>
                  {viewingDecision.dateValidation && (
                    <div>
                      <span className="text-muted-foreground">Date de validation:</span>
                      <p className="font-medium">{new Date(viewingDecision.dateValidation).toLocaleDateString("fr-FR")}</p>
                    </div>
                  )}
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

export default JugeDecisions;
