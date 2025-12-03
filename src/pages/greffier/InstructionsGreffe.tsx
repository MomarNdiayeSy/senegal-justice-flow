import { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, CheckCircle, Clock, Send, User, Calendar, FileText, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  jugeNom: string;
  reponse?: string;
  dateReponse?: string;
}

const InstructionsGreffe = () => {
  const { audiences, dossiers, users, currentUser, addNotification, addLog, updateAudience } = useApp();
  const { toast } = useToast();
  const [selectedInstruction, setSelectedInstruction] = useState<Instruction | null>(null);
  const [reponse, setReponse] = useState("");

  const [instructions, setInstructions] = useState<Instruction[]>([
    {
      id: "1",
      type: "report_audience",
      objet: "Demande de report d'audience",
      contenu: "Je sollicite le report de l'audience AUD-2025-003 au motif que l'avocat de la défense est indisponible à la date prévue. Merci de proposer une nouvelle date dans les meilleurs délais.",
      audienceId: "3",
      dateCreation: "2025-01-18T10:30:00",
      statut: "envoyee",
      jugeId: "3",
      jugeNom: "Juge Moussa Ba"
    },
    {
      id: "2",
      type: "demande_pieces",
      objet: "Demande de pièces complémentaires",
      contenu: "Merci de solliciter auprès du demandeur les relevés bancaires des 6 derniers mois relatifs au compte litigieux dans l'affaire DOS-2025-001.",
      dossierId: "1",
      dateCreation: "2025-01-20T14:15:00",
      statut: "en_cours",
      jugeId: "3",
      jugeNom: "Juge Moussa Ba"
    },
    {
      id: "3",
      type: "convocation",
      objet: "Demande de convocation témoin",
      contenu: "Veuillez convoquer M. Ibrahima Diop en qualité de témoin pour l'audience du 25/01/2025.",
      audienceId: "4",
      dateCreation: "2025-01-15T09:00:00",
      statut: "traitee",
      jugeId: "3",
      jugeNom: "Juge Moussa Ba",
      reponse: "Convocation envoyée à M. Ibrahima Diop par courrier recommandé et par email. Accusé de réception confirmé.",
      dateReponse: "2025-01-16T11:30:00"
    }
  ]);

  const instructionsEnvoyees = instructions.filter(i => i.statut === "envoyee");
  const instructionsEnCours = instructions.filter(i => i.statut === "en_cours");
  const instructionsTraitees = instructions.filter(i => i.statut === "traitee");

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
      envoyee: { style: "bg-blue-100 text-blue-700", label: "Nouvelle" },
      en_cours: { style: "bg-amber-100 text-amber-700", label: "En cours" },
      traitee: { style: "bg-green-100 text-green-700", label: "Traitée" }
    };
    return config[statut];
  };

  const handlePriseEnCharge = (instruction: Instruction) => {
    setInstructions(instructions.map(i => 
      i.id === instruction.id ? { ...i, statut: "en_cours" as const } : i
    ));
    toast({ title: "Instruction prise en charge" });
  };

  const handleTraiter = () => {
    if (!selectedInstruction || !reponse) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir une réponse",
        variant: "destructive"
      });
      return;
    }

    // If it's a report request, update the audience status
    if (selectedInstruction.type === "report_audience" && selectedInstruction.audienceId) {
      updateAudience(selectedInstruction.audienceId, { statut: "reportee" });
    }

    setInstructions(instructions.map(i => 
      i.id === selectedInstruction.id ? {
        ...i,
        statut: "traitee" as const,
        reponse,
        dateReponse: new Date().toISOString()
      } : i
    ));

    // Notify the judge
    addNotification({
      type: "commentaire_ajoute",
      titre: "Instruction traitée",
      message: `Votre instruction "${selectedInstruction.objet}" a été traitée par le greffe`,
      destinataireId: selectedInstruction.jugeId,
      statut: "envoye",
      canal: "email",
      tentatives: 1
    });

    addLog({
      userId: currentUser?.id || "",
      action: "Traitement instruction",
      details: `Instruction "${selectedInstruction.objet}" traitée`
    });

    toast({
      title: "Instruction traitée",
      description: "Le magistrat a été notifié"
    });

    setSelectedInstruction(null);
    setReponse("");
  };

  const InstructionCard = ({ instruction }: { instruction: Instruction }) => {
    const typeBadge = getTypeBadge(instruction.type);
    const statutBadge = getStatutBadge(instruction.statut);
    const TypeIcon = typeBadge.icon;
    const audience = instruction.audienceId ? audiences.find(a => a.id === instruction.audienceId) : null;
    const dossier = instruction.dossierId ? dossiers.find(d => d.id === instruction.dossierId) : null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`p-4 rounded-lg border bg-card ${instruction.statut === "envoyee" ? "border-blue-300 bg-blue-50/50" : ""}`}
      >
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={typeBadge.style}>
                <TypeIcon className="w-3 h-3 mr-1" />
                {typeBadge.label}
              </Badge>
              <Badge className={statutBadge.style}>{statutBadge.label}</Badge>
              {instruction.statut === "envoyee" && (
                <Badge className="bg-red-100 text-red-700">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  À traiter
                </Badge>
              )}
            </div>
            <span className="text-sm text-muted-foreground">
              {new Date(instruction.dateCreation).toLocaleDateString("fr-FR")} à {new Date(instruction.dateCreation).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <User className="w-4 h-4" />
              {instruction.jugeNom}
            </div>
            <h4 className="font-semibold">{instruction.objet}</h4>
            {audience && (
              <p className="text-sm text-primary">
                Audience: {audience.numero} - {audience.parties}
              </p>
            )}
            {dossier && (
              <p className="text-sm text-primary">
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
                Réponse ({new Date(instruction.dateReponse!).toLocaleDateString("fr-FR")})
              </div>
              <p className="text-sm text-green-800">{instruction.reponse}</p>
            </div>
          )}

          {instruction.statut !== "traitee" && (
            <div className="flex justify-end gap-2 pt-2">
              {instruction.statut === "envoyee" && (
                <Button size="sm" variant="outline" onClick={() => handlePriseEnCharge(instruction)}>
                  <Clock className="w-4 h-4 mr-1" />
                  Prendre en charge
                </Button>
              )}
              {instruction.statut === "en_cours" && (
                <Button size="sm" onClick={() => setSelectedInstruction(instruction)}>
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Traiter
                </Button>
              )}
            </div>
          )}
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
            <h1 className="text-2xl md:text-3xl font-bold text-primary">Instructions des Magistrats</h1>
            <p className="text-muted-foreground mt-1">Gérer les demandes des juges et procureurs</p>
          </div>
          <MessageSquare className="w-10 h-10 text-primary" />
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className={instructionsEnvoyees.length > 0 ? "border-blue-300" : ""}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-blue-100">
                  <AlertCircle className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{instructionsEnvoyees.length}</p>
                  <p className="text-sm text-muted-foreground">Nouvelles</p>
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
                  <p className="text-2xl font-bold">{instructionsEnCours.length}</p>
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
                  <p className="text-2xl font-bold">{instructionsTraitees.length}</p>
                  <p className="text-sm text-muted-foreground">Traitées</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="nouvelles" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="nouvelles" className="relative">
              Nouvelles ({instructionsEnvoyees.length})
              {instructionsEnvoyees.length > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </TabsTrigger>
            <TabsTrigger value="en-cours">
              En cours ({instructionsEnCours.length})
            </TabsTrigger>
            <TabsTrigger value="traitees">
              Traitées ({instructionsTraitees.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="nouvelles">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-600" />
                  Nouvelles instructions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {instructionsEnvoyees.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Aucune nouvelle instruction</p>
                ) : (
                  <div className="space-y-4">
                    {instructionsEnvoyees.map(instruction => (
                      <InstructionCard key={instruction.id} instruction={instruction} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="en-cours">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-600" />
                  Instructions en cours de traitement
                </CardTitle>
              </CardHeader>
              <CardContent>
                {instructionsEnCours.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Aucune instruction en cours</p>
                ) : (
                  <div className="space-y-4">
                    {instructionsEnCours.map(instruction => (
                      <InstructionCard key={instruction.id} instruction={instruction} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="traitees">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Instructions traitées
                </CardTitle>
              </CardHeader>
              <CardContent>
                {instructionsTraitees.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Aucune instruction traitée</p>
                ) : (
                  <div className="space-y-4">
                    {instructionsTraitees.map(instruction => (
                      <InstructionCard key={instruction.id} instruction={instruction} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modal de traitement */}
        {selectedInstruction && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-lg">
              <CardHeader>
                <CardTitle>Traiter l'instruction</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-medium">{selectedInstruction.objet}</p>
                  <p className="text-sm text-muted-foreground">{selectedInstruction.jugeNom}</p>
                </div>
                <div className="bg-muted p-3 rounded-lg text-sm">
                  {selectedInstruction.contenu}
                </div>
                <div>
                  <Label>Votre réponse *</Label>
                  <Textarea
                    value={reponse}
                    onChange={(e) => setReponse(e.target.value)}
                    placeholder="Décrivez les actions effectuées..."
                    rows={4}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => { setSelectedInstruction(null); setReponse(""); }}>
                    Annuler
                  </Button>
                  <Button onClick={handleTraiter}>
                    <Send className="w-4 h-4 mr-2" />
                    Envoyer la réponse
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default InstructionsGreffe;
