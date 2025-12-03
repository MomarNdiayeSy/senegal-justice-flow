import { useState } from "react";
import { motion } from "framer-motion";
import { Send, MessageSquare, Calendar, Clock, User, CheckCircle, AlertCircle, Plus, FileText } from "lucide-react";
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

interface Instruction {
  id: string;
  type: "report_audience" | "demande_pieces" | "convocation" | "autre";
  objet: string;
  contenu: string;
  audienceId?: string;
  dossierId?: string;
  dateCreation: string;
  statut: "envoyee" | "en_cours" | "traitee";
  jugeId: string;
  greffierId?: string;
  reponse?: string;
  dateReponse?: string;
}

const JugeInstructions = () => {
  const { audiences, dossiers, currentUser, users, addNotification, addLog } = useApp();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [instructions, setInstructions] = useState<Instruction[]>([
    {
      id: "1",
      type: "report_audience",
      objet: "Demande de report d'audience",
      contenu: "Je sollicite le report de l'audience AUD-2025-003 au motif que l'avocat de la défense est indisponible à la date prévue.",
      audienceId: "3",
      dateCreation: "2025-01-18",
      statut: "traitee",
      jugeId: "3",
      greffierId: "2",
      reponse: "Audience reportée au 25/01/2025 à 14h00. Les parties ont été notifiées.",
      dateReponse: "2025-01-19"
    },
    {
      id: "2",
      type: "demande_pieces",
      objet: "Demande de pièces complémentaires",
      contenu: "Merci de solliciter auprès du demandeur les relevés bancaires des 6 derniers mois relatifs au compte litigieux.",
      dossierId: "1",
      dateCreation: "2025-01-20",
      statut: "en_cours",
      jugeId: "3",
      greffierId: "2"
    }
  ]);

  const [formData, setFormData] = useState({
    type: "report_audience" as Instruction["type"],
    objet: "",
    contenu: "",
    audienceId: "",
    dossierId: ""
  });

  const mesAudiences = audiences.filter(a => a.jugeId === currentUser?.id);
  const greffiers = users.filter(u => u.role === "greffier");
  const mesInstructions = instructions.filter(i => i.jugeId === currentUser?.id);

  const getTypeBadge = (type: Instruction["type"]) => {
    const config = {
      report_audience: { style: "bg-orange-100 text-orange-700", label: "Report d'audience", icon: Calendar },
      demande_pieces: { style: "bg-blue-100 text-blue-700", label: "Demande de pièces", icon: FileText },
      convocation: { style: "bg-purple-100 text-purple-700", label: "Convocation", icon: User },
      autre: { style: "bg-gray-100 text-gray-700", label: "Autre", icon: MessageSquare }
    };
    return config[type];
  };

  const getStatutBadge = (statut: Instruction["statut"]) => {
    const config = {
      envoyee: { style: "bg-blue-100 text-blue-700", label: "Envoyée", icon: Send },
      en_cours: { style: "bg-amber-100 text-amber-700", label: "En cours", icon: Clock },
      traitee: { style: "bg-green-100 text-green-700", label: "Traitée", icon: CheckCircle }
    };
    return config[statut];
  };

  const handleSubmit = () => {
    if (!formData.objet || !formData.contenu) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    const newInstruction: Instruction = {
      id: Date.now().toString(),
      type: formData.type,
      objet: formData.objet,
      contenu: formData.contenu,
      audienceId: formData.audienceId || undefined,
      dossierId: formData.dossierId || undefined,
      dateCreation: new Date().toISOString(),
      statut: "envoyee",
      jugeId: currentUser?.id || ""
    };

    setInstructions([newInstruction, ...instructions]);

    // Notify all greffiers
    greffiers.forEach(greffier => {
      addNotification({
        type: "commentaire_ajoute",
        titre: "Nouvelle instruction du magistrat",
        message: `${currentUser?.prenom} ${currentUser?.nom}: ${formData.objet}`,
        destinataireId: greffier.id,
        statut: "envoye",
        canal: "email",
        tentatives: 1
      });
    });

    addLog({
      userId: currentUser?.id || "",
      action: "Instruction envoyée",
      details: `Instruction "${formData.objet}" envoyée au greffe`
    });

    toast({
      title: "Instruction envoyée",
      description: "Votre instruction a été transmise au greffe"
    });

    setFormData({ type: "report_audience", objet: "", contenu: "", audienceId: "", dossierId: "" });
    setIsDialogOpen(false);
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
            <h1 className="text-2xl md:text-3xl font-bold text-primary">Instructions au Greffe</h1>
            <p className="text-muted-foreground mt-1">Communiquez vos instructions au service du greffe</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Nouvelle instruction
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Envoyer une instruction</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Type d'instruction *</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as Instruction["type"] })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="report_audience">Report d'audience</SelectItem>
                      <SelectItem value="demande_pieces">Demande de pièces</SelectItem>
                      <SelectItem value="convocation">Convocation</SelectItem>
                      <SelectItem value="autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {formData.type === "report_audience" && (
                  <div>
                    <Label>Audience concernée</Label>
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
                )}

                {formData.type === "demande_pieces" && (
                  <div>
                    <Label>Dossier concerné</Label>
                    <Select value={formData.dossierId} onValueChange={(value) => setFormData({ ...formData, dossierId: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un dossier" />
                      </SelectTrigger>
                      <SelectContent>
                        {dossiers.map(dossier => (
                          <SelectItem key={dossier.id} value={dossier.id}>
                            {dossier.numero} - {dossier.titre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label>Objet *</Label>
                  <Input
                    value={formData.objet}
                    onChange={(e) => setFormData({ ...formData, objet: e.target.value })}
                    placeholder="Ex: Demande de report d'audience"
                  />
                </div>
                <div>
                  <Label>Instruction détaillée *</Label>
                  <Textarea
                    value={formData.contenu}
                    onChange={(e) => setFormData({ ...formData, contenu: e.target.value })}
                    placeholder="Détaillez votre instruction..."
                    rows={5}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleSubmit}>
                    <Send className="w-4 h-4 mr-2" />
                    Envoyer
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-blue-100">
                  <Send className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{mesInstructions.filter(i => i.statut === "envoyee").length}</p>
                  <p className="text-sm text-muted-foreground">Envoyées</p>
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
                  <p className="text-2xl font-bold">{mesInstructions.filter(i => i.statut === "en_cours").length}</p>
                  <p className="text-sm text-muted-foreground">En cours</p>
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
                  <p className="text-2xl font-bold">{mesInstructions.filter(i => i.statut === "traitee").length}</p>
                  <p className="text-sm text-muted-foreground">Traitées</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Liste des instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Mes instructions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {mesInstructions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Aucune instruction envoyée</p>
            ) : (
              <div className="space-y-4">
                {mesInstructions.map((instruction) => {
                  const typeBadge = getTypeBadge(instruction.type);
                  const statutBadge = getStatutBadge(instruction.statut);
                  const TypeIcon = typeBadge.icon;
                  const StatutIcon = statutBadge.icon;
                  const audience = instruction.audienceId ? audiences.find(a => a.id === instruction.audienceId) : null;
                  const dossier = instruction.dossierId ? dossiers.find(d => d.id === instruction.dossierId) : null;

                  return (
                    <motion.div
                      key={instruction.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-4 rounded-lg border bg-card"
                    >
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge className={typeBadge.style}>
                              <TypeIcon className="w-3 h-3 mr-1" />
                              {typeBadge.label}
                            </Badge>
                            <Badge className={statutBadge.style}>
                              <StatutIcon className="w-3 h-3 mr-1" />
                              {statutBadge.label}
                            </Badge>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(instruction.dateCreation).toLocaleDateString("fr-FR")}
                          </span>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold">{instruction.objet}</h4>
                          {audience && (
                            <p className="text-sm text-muted-foreground">
                              Audience: {audience.numero} - {audience.parties}
                            </p>
                          )}
                          {dossier && (
                            <p className="text-sm text-muted-foreground">
                              Dossier: {dossier.numero} - {dossier.titre}
                            </p>
                          )}
                        </div>

                        <div className="bg-muted p-3 rounded-lg text-sm">
                          {instruction.contenu}
                        </div>

                        {instruction.reponse && (
                          <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                            <div className="flex items-center gap-2 text-green-700 font-medium text-sm mb-1">
                              <CheckCircle className="w-4 h-4" />
                              Réponse du greffe ({new Date(instruction.dateReponse!).toLocaleDateString("fr-FR")})
                            </div>
                            <p className="text-sm text-green-800">{instruction.reponse}</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default JugeInstructions;
