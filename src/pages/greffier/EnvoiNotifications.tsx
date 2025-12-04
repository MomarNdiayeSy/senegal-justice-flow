import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Send, Bell, Users, Mail, MessageSquare, Smartphone, 
  Calendar, FileText, Gavel, AlertTriangle, CheckCircle2,
  Search, Filter, User, Clock, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import DashboardLayout from "@/components/DashboardLayout";
import { useApp, Notification } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";

const EnvoiNotifications = () => {
  const { users, audiences, dossiers, addNotification, currentUser } = useApp();
  const { toast } = useToast();
  
  // États pour le formulaire d'envoi manuel
  const [notificationType, setNotificationType] = useState<string>("");
  const [selectedDestinataires, setSelectedDestinataires] = useState<string[]>([]);
  const [selectedCanaux, setSelectedCanaux] = useState<string[]>(["email"]);
  const [titre, setTitre] = useState("");
  const [message, setMessage] = useState("");
  const [selectedAudience, setSelectedAudience] = useState<string>("");
  const [selectedDossier, setSelectedDossier] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Types de notifications disponibles
  const notificationTypes = [
    { value: "convocation_recue", label: "Convocation à une audience", icon: Calendar, color: "bg-blue-500" },
    { value: "audience_reportee", label: "Report d'audience", icon: Clock, color: "bg-amber-500" },
    { value: "audience_annulee", label: "Annulation d'audience", icon: AlertTriangle, color: "bg-red-500" },
    { value: "decision_rendue", label: "Décision rendue", icon: Gavel, color: "bg-green-500" },
    { value: "dossier_modifie", label: "Modification de dossier", icon: FileText, color: "bg-purple-500" },
    { value: "piece_ajoutee", label: "Nouvelle pièce ajoutée", icon: FileText, color: "bg-indigo-500" },
    { value: "echeance_proche", label: "Rappel d'échéance", icon: Bell, color: "bg-orange-500" },
  ];

  // Templates de messages
  const messageTemplates: Record<string, { titre: string; message: string }> = {
    convocation_recue: {
      titre: "Convocation à l'audience",
      message: "Vous êtes convoqué(e) à l'audience du [DATE] à [HEURE] dans la salle [SALLE] du Tribunal de [TRIBUNAL]. Veuillez vous présenter avec les pièces justificatives nécessaires."
    },
    audience_reportee: {
      titre: "Report de votre audience",
      message: "Nous vous informons que l'audience initialement prévue le [ANCIENNE_DATE] a été reportée au [NOUVELLE_DATE] à [HEURE]. Nous vous prions de nous excuser pour ce désagrément."
    },
    audience_annulee: {
      titre: "Annulation de l'audience",
      message: "L'audience prévue le [DATE] concernant l'affaire [AFFAIRE] a été annulée. Vous serez informé(e) de la nouvelle date ultérieurement."
    },
    decision_rendue: {
      titre: "Décision judiciaire rendue",
      message: "Une décision a été rendue concernant votre affaire [AFFAIRE]. Vous pouvez consulter les détails sur la plateforme e-Justice ou vous présenter au greffe du tribunal."
    },
    dossier_modifie: {
      titre: "Modification de votre dossier",
      message: "Votre dossier [NUMERO] a été mis à jour. De nouvelles informations ou pièces ont été ajoutées. Consultez votre espace personnel pour plus de détails."
    },
    piece_ajoutee: {
      titre: "Nouvelle pièce ajoutée au dossier",
      message: "Une nouvelle pièce a été ajoutée au dossier [NUMERO]. Vous pouvez la consulter dans votre espace personnel sur la plateforme e-Justice."
    },
    echeance_proche: {
      titre: "Rappel : Échéance proche",
      message: "Nous vous rappelons que l'échéance [ECHEANCE] concernant votre affaire approche. Veuillez prendre les dispositions nécessaires."
    }
  };

  // Filtrer les utilisateurs
  const filteredUsers = users.filter(u => {
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    const matchesSearch = u.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch && u.id !== currentUser?.id;
  });

  // Sélectionner un template
  const handleTypeChange = (type: string) => {
    setNotificationType(type);
    if (messageTemplates[type]) {
      setTitre(messageTemplates[type].titre);
      setMessage(messageTemplates[type].message);
    }
  };

  // Sélectionner/désélectionner tous les destinataires filtrés
  const toggleSelectAll = () => {
    if (selectedDestinataires.length === filteredUsers.length) {
      setSelectedDestinataires([]);
    } else {
      setSelectedDestinataires(filteredUsers.map(u => u.id));
    }
  };

  // Toggle un destinataire
  const toggleDestinataire = (userId: string) => {
    if (selectedDestinataires.includes(userId)) {
      setSelectedDestinataires(selectedDestinataires.filter(id => id !== userId));
    } else {
      setSelectedDestinataires([...selectedDestinataires, userId]);
    }
  };

  // Toggle un canal
  const toggleCanal = (canal: string) => {
    if (selectedCanaux.includes(canal)) {
      setSelectedCanaux(selectedCanaux.filter(c => c !== canal));
    } else {
      setSelectedCanaux([...selectedCanaux, canal]);
    }
  };

  // Envoyer les notifications
  const handleSendNotifications = () => {
    if (!notificationType) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un type de notification",
        variant: "destructive"
      });
      return;
    }

    if (selectedDestinataires.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner au moins un destinataire",
        variant: "destructive"
      });
      return;
    }

    if (selectedCanaux.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner au moins un canal d'envoi",
        variant: "destructive"
      });
      return;
    }

    if (!titre || !message) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir le titre et le message",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);

    // Simuler l'envoi
    setTimeout(() => {
      // Créer une notification pour chaque destinataire et chaque canal
      selectedDestinataires.forEach(destinataireId => {
        selectedCanaux.forEach(canal => {
          addNotification({
            type: notificationType as Notification["type"],
            titre,
            message,
            destinataireId,
            statut: "envoye",
            canal: canal as "email" | "sms" | "whatsapp",
            tentatives: 1,
            audienceId: selectedAudience || undefined
          });
        });
      });

      toast({
        title: "✓ Notifications envoyées",
        description: `${selectedDestinataires.length} destinataire(s) notifié(s) via ${selectedCanaux.length} canal(aux)`,
      });

      // Réinitialiser le formulaire
      setSelectedDestinataires([]);
      setNotificationType("");
      setTitre("");
      setMessage("");
      setSelectedAudience("");
      setSelectedDossier("");
      setIsSending(false);
    }, 1500);
  };

  // Envoi rapide pour une audience spécifique
  const handleQuickSendForAudience = (audienceId: string, type: "convocation" | "report" | "annulation") => {
    const audience = audiences.find(a => a.id === audienceId);
    if (!audience) return;

    // Trouver tous les destinataires liés à l'audience
    const destinataires = [
      audience.jugeId,
      audience.procureurId,
      ...audience.avocatIds,
      audience.justiciableId
    ].filter(Boolean) as string[];

    setSelectedDestinataires(destinataires);
    setSelectedAudience(audienceId);

    if (type === "convocation") {
      handleTypeChange("convocation_recue");
      setMessage(messageTemplates.convocation_recue.message
        .replace("[DATE]", audience.date)
        .replace("[HEURE]", audience.heure)
        .replace("[SALLE]", audience.salle)
        .replace("[TRIBUNAL]", "Dakar")
      );
    } else if (type === "report") {
      handleTypeChange("audience_reportee");
    } else if (type === "annulation") {
      handleTypeChange("audience_annulee");
    }

    toast({
      title: "Formulaire pré-rempli",
      description: `${destinataires.length} destinataire(s) sélectionné(s) pour l'audience ${audience.numero}`,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-primary/10">
              <Send className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-primary">Envoi de Notifications</h1>
              <p className="text-muted-foreground">Notifier les parties prenantes par Email, SMS ou WhatsApp</p>
            </div>
          </div>
        </motion.div>

        {/* Info Alert */}
        <Alert className="border-primary/20 bg-primary/5">
          <Info className="h-4 w-4 text-primary" />
          <AlertTitle>Qui peut envoyer des notifications ?</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              <li><strong>Greffier :</strong> Convocations, reports d'audience, validation de décisions, documents ajoutés</li>
              <li><strong>Juge :</strong> Décisions rendues, instructions envoyées au greffe</li>
              <li><strong>Système :</strong> Rappels automatiques, échéances, modifications de dossiers</li>
            </ul>
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="manuel" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="manuel">Envoi manuel</TabsTrigger>
            <TabsTrigger value="rapide">Envoi rapide</TabsTrigger>
          </TabsList>

          {/* Envoi Manuel */}
          <TabsContent value="manuel" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Colonne 1: Type et contenu */}
              <Card className="shadow-md border-0 lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Contenu de la notification
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Type de notification */}
                  <div className="space-y-2">
                    <Label>Type de notification *</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {notificationTypes.map((type) => (
                        <motion.div
                          key={type.value}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div
                            className={`p-3 rounded-lg border cursor-pointer transition-all ${
                              notificationType === type.value
                                ? "border-primary bg-primary/10"
                                : "hover:border-muted-foreground/50"
                            }`}
                            onClick={() => handleTypeChange(type.value)}
                          >
                            <div className="flex items-center gap-2">
                              <div className={`p-2 rounded-full ${type.color}`}>
                                <type.icon className="w-4 h-4 text-white" />
                              </div>
                              <span className="text-sm font-medium">{type.label}</span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Lier à une audience ou dossier */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Lier à une audience (optionnel)</Label>
                      <Select value={selectedAudience} onValueChange={setSelectedAudience}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une audience" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Aucune</SelectItem>
                          {audiences.map(a => (
                            <SelectItem key={a.id} value={a.id}>
                              {a.numero} - {a.parties}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Lier à un dossier (optionnel)</Label>
                      <Select value={selectedDossier} onValueChange={setSelectedDossier}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un dossier" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Aucun</SelectItem>
                          {dossiers.map(d => (
                            <SelectItem key={d.id} value={d.id}>
                              {d.numero} - {d.titre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  {/* Titre */}
                  <div className="space-y-2">
                    <Label htmlFor="titre">Titre *</Label>
                    <Input
                      id="titre"
                      placeholder="Titre de la notification"
                      value={titre}
                      onChange={(e) => setTitre(e.target.value)}
                    />
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      placeholder="Contenu du message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={6}
                    />
                    <p className="text-xs text-muted-foreground">
                      Variables disponibles: [DATE], [HEURE], [SALLE], [AFFAIRE], [NUMERO], [TRIBUNAL]
                    </p>
                  </div>

                  {/* Canaux d'envoi */}
                  <div className="space-y-3">
                    <Label>Canaux d'envoi *</Label>
                    <div className="flex flex-wrap gap-4">
                      <div
                        className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedCanaux.includes("email") ? "border-primary bg-primary/10" : ""
                        }`}
                        onClick={() => toggleCanal("email")}
                      >
                        <Checkbox checked={selectedCanaux.includes("email")} />
                        <Mail className="w-4 h-4" />
                        <span>Email</span>
                      </div>
                      <div
                        className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedCanaux.includes("sms") ? "border-primary bg-primary/10" : ""
                        }`}
                        onClick={() => toggleCanal("sms")}
                      >
                        <Checkbox checked={selectedCanaux.includes("sms")} />
                        <Smartphone className="w-4 h-4" />
                        <span>SMS</span>
                      </div>
                      <div
                        className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedCanaux.includes("whatsapp") ? "border-primary bg-primary/10" : ""
                        }`}
                        onClick={() => toggleCanal("whatsapp")}
                      >
                        <Checkbox checked={selectedCanaux.includes("whatsapp")} />
                        <MessageSquare className="w-4 h-4" />
                        <span>WhatsApp</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Colonne 2: Destinataires */}
              <Card className="shadow-md border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Destinataires
                  </CardTitle>
                  <CardDescription>
                    {selectedDestinataires.length} sélectionné(s)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Filtres */}
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Rechercher..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filtrer par rôle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les rôles</SelectItem>
                        <SelectItem value="juge">Juges</SelectItem>
                        <SelectItem value="avocat">Avocats</SelectItem>
                        <SelectItem value="procureur">Procureurs</SelectItem>
                        <SelectItem value="justiciable">Justiciables</SelectItem>
                        <SelectItem value="greffier">Greffiers</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sélectionner tout */}
                  <div
                    className="flex items-center gap-2 p-2 rounded bg-muted/50 cursor-pointer hover:bg-muted"
                    onClick={toggleSelectAll}
                  >
                    <Checkbox
                      checked={selectedDestinataires.length === filteredUsers.length && filteredUsers.length > 0}
                    />
                    <span className="text-sm font-medium">
                      Sélectionner tout ({filteredUsers.length})
                    </span>
                  </div>

                  <Separator />

                  {/* Liste des utilisateurs */}
                  <div className="max-h-[400px] overflow-y-auto space-y-2">
                    {filteredUsers.map((user) => (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedDestinataires.includes(user.id)
                            ? "border-primary bg-primary/5"
                            : "hover:bg-muted/50"
                        }`}
                        onClick={() => toggleDestinataire(user.id)}
                      >
                        <Checkbox checked={selectedDestinataires.includes(user.id)} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {user.prenom} {user.nom}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {user.email}
                          </p>
                        </div>
                        <Badge variant="secondary" className="capitalize text-xs">
                          {user.role}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Bouton d'envoi */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-end"
            >
              <Button
                size="lg"
                className="shadow-gold gap-2"
                onClick={handleSendNotifications}
                disabled={isSending || selectedDestinataires.length === 0}
              >
                {isSending ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Envoyer les notifications ({selectedDestinataires.length})
                  </>
                )}
              </Button>
            </motion.div>
          </TabsContent>

          {/* Envoi Rapide */}
          <TabsContent value="rapide" className="space-y-6">
            <Card className="shadow-md border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Envoi rapide par audience
                </CardTitle>
                <CardDescription>
                  Sélectionnez une audience pour notifier automatiquement toutes les parties
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {audiences.map((audience) => (
                    <motion.div
                      key={audience.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-lg border hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold">{audience.numero}</h3>
                            <Badge variant={
                              audience.statut === "prevue" ? "default" :
                              audience.statut === "en_cours" ? "secondary" :
                              audience.statut === "reportee" ? "outline" : "secondary"
                            }>
                              {audience.statut}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{audience.parties}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {audience.date} à {audience.heure} - {audience.salle}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1"
                            onClick={() => handleQuickSendForAudience(audience.id, "convocation")}
                          >
                            <Calendar className="w-3 h-3" />
                            Convoquer
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 text-amber-600 border-amber-200 hover:bg-amber-50"
                            onClick={() => handleQuickSendForAudience(audience.id, "report")}
                          >
                            <Clock className="w-3 h-3" />
                            Reporter
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => handleQuickSendForAudience(audience.id, "annulation")}
                          >
                            <AlertTriangle className="w-3 h-3" />
                            Annuler
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Notifications automatiques */}
            <Card className="shadow-md border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" />
                  Notifications automatiques
                </CardTitle>
                <CardDescription>
                  Ces notifications sont envoyées automatiquement par le système
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { event: "Création d'audience", trigger: "Quand une audience est créée", recipients: "Juge, Avocat(s), Justiciable, Procureur" },
                    { event: "Report d'audience", trigger: "Quand une audience est reportée", recipients: "Toutes les parties de l'audience" },
                    { event: "Décision publiée", trigger: "Quand le greffier valide une décision", recipients: "Avocat(s), Justiciable, Procureur" },
                    { event: "Document ajouté", trigger: "Quand un document est ajouté au dossier", recipients: "Utilisateurs ayant accès au dossier" },
                    { event: "Échéance proche", trigger: "48h avant une audience", recipients: "Toutes les parties de l'audience" },
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium">{item.event}</p>
                        <p className="text-sm text-muted-foreground">{item.trigger}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          <strong>Destinataires :</strong> {item.recipients}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default EnvoiNotifications;
