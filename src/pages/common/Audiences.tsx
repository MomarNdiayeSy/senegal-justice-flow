import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Edit, Trash2, Eye, Calendar, Clock, MapPin, Users, QrCode, History, Filter, X, Lock, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import DashboardLayout from "@/components/DashboardLayout";
import { useApp, Audience, UserRole } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";
import { usePermissions } from "@/hooks/usePermissions";
import { QRCodeSVG } from "qrcode.react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Audiences = () => {
  const { audiences, users, dossiers, addAudience, updateAudience, deleteAudience, currentUser } = useApp();
  const { toast } = useToast();
  const { 
    canCreateAudience, 
    canAccessAudience, 
    canEditSpecificAudience,
    getAccessibleAudiences,
    permissions 
  } = usePermissions();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [editingAudience, setEditingAudience] = useState<Audience | null>(null);
  const [selectedAudience, setSelectedAudience] = useState<Audience | null>(null);
  const [filters, setFilters] = useState({
    date: "",
    jugeId: "",
    avocatId: "",
    statut: "" as Audience["statut"] | ""
  });
  const [formData, setFormData] = useState({
    numero: "",
    parties: "",
    date: "",
    heure: "",
    salle: "",
    jugeId: "",
    procureurId: "",
    avocatIds: [] as string[],
    justiciableId: "",
    statut: "prevue" as Audience["statut"],
    dossierId: ""
  });

  // Dossiers disponibles (avec au moins un justiciable)
  const dossiersDisponibles = dossiers.filter(d => d.justiciableId);

  // Auto-remplir les parties quand un dossier est sélectionné
  const handleDossierChange = (dossierId: string) => {
    if (dossierId === "__none__" || !dossierId) {
      setFormData({ 
        ...formData, 
        dossierId: "",
        parties: "",
        jugeId: "",
        procureurId: "",
        avocatIds: [],
        justiciableId: ""
      });
      return;
    }

    const dossier = dossiers.find(d => d.id === dossierId);
    if (dossier) {
      const justiciable = users.find(u => u.id === dossier.justiciableId);
      const avocatNames = dossier.avocatIds?.map(id => {
        const avocat = users.find(u => u.id === id);
        return avocat ? `${avocat.prenom} ${avocat.nom}` : '';
      }).filter(Boolean).join(', ');
      
      const partiesText = justiciable 
        ? `${justiciable.prenom} ${justiciable.nom}${avocatNames ? ` (Avocat: ${avocatNames})` : ''}`
        : dossier.titre;

      setFormData({
        ...formData,
        dossierId,
        parties: partiesText,
        jugeId: dossier.jugeId || "",
        procureurId: dossier.procureurId || "",
        avocatIds: dossier.avocatIds || [],
        justiciableId: dossier.justiciableId || ""
      });
      
      toast({
        title: "Dossier sélectionné",
        description: "Les parties ont été automatiquement importées du dossier."
      });
    }
  };

  const statutLabels = {
    prevue: { label: "Prévue", color: "bg-green-500" },
    en_cours: { label: "En cours", color: "bg-yellow-500" },
    reportee: { label: "Reportée", color: "bg-blue-500" },
    terminee: { label: "Terminée", color: "bg-red-500" }
  };

  // Obtenir les audiences accessibles selon le rôle
  const accessibleAudiences = getAccessibleAudiences();

  // Filtrage des audiences accessibles
  const filteredAudiences = accessibleAudiences.filter(audience => {
    const matchesSearch = 
      audience.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      audience.parties.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = !filters.date || audience.date === filters.date;
    const matchesJuge = !filters.jugeId || audience.jugeId === filters.jugeId;
    const matchesAvocat = !filters.avocatId || audience.avocatIds.includes(filters.avocatId);
    const matchesStatut = !filters.statut || audience.statut === filters.statut;

    return matchesSearch && matchesDate && matchesJuge && matchesAvocat && matchesStatut;
  });

  const resetFilters = () => {
    setFilters({
      date: "",
      jugeId: "",
      avocatId: "",
      statut: ""
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation : dossier obligatoire pour nouvelle audience
    if (!editingAudience && !formData.dossierId) {
      toast({
        title: "Dossier requis",
        description: "Veuillez d'abord sélectionner un dossier pour créer une audience.",
        variant: "destructive"
      });
      return;
    }
    
    // Validation basique
    if (!formData.numero || !formData.date || !formData.heure || !formData.salle || !formData.jugeId) {
      toast({
        title: "Erreur de validation",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    // Vérifier les conflits de salle
    const conflictingSalle = audiences.find(a => 
      a.salle === formData.salle && 
      a.date === formData.date && 
      a.heure === formData.heure &&
      a.id !== editingAudience?.id
    );
    
    if (conflictingSalle) {
      toast({
        title: "Conflit de salle",
        description: `La ${formData.salle} est déjà occupée le ${formData.date} à ${formData.heure} par l'audience ${conflictingSalle.numero}`,
        variant: "destructive"
      });
      return;
    }

    if (editingAudience) {
      updateAudience(editingAudience.id, formData);
      toast({
        title: "✓ Audience modifiée",
        description: `L'audience ${formData.numero} a été mise à jour avec succès.`
      });
    } else {
      // Vérifier si le numéro existe déjà
      if (audiences.find(a => a.numero === formData.numero)) {
        toast({
          title: "Numéro déjà utilisé",
          description: "Ce numéro d'audience existe déjà",
          variant: "destructive"
        });
        return;
      }
      
      addAudience(formData);
      toast({
        title: "✓ Audience créée",
        description: `L'audience ${formData.numero} a été créée. Les notifications ont été envoyées.`
      });
    }
    
    setDialogOpen(false);
    setEditingAudience(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      numero: "",
      parties: "",
      date: "",
      heure: "",
      salle: "",
      jugeId: "",
      procureurId: "",
      avocatIds: [],
      justiciableId: "",
      statut: "prevue",
      dossierId: ""
    });
  };

  const handleEdit = (audience: Audience) => {
    setEditingAudience(audience);
    setFormData({
      numero: audience.numero,
      parties: audience.parties,
      date: audience.date,
      heure: audience.heure,
      salle: audience.salle,
      jugeId: audience.jugeId,
      procureurId: audience.procureurId || "",
      avocatIds: audience.avocatIds,
      justiciableId: audience.justiciableId,
      statut: audience.statut,
      dossierId: audience.dossierId || ""
    });
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    const audience = audiences.find(a => a.id === id);
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'audience ${audience?.numero} ? Cette action est irréversible.`)) {
      deleteAudience(id);
      toast({
        title: "✓ Audience supprimée",
        description: `L'audience ${audience?.numero} a été supprimée avec succès.`
      });
    }
  };

  const handleAvocatToggle = (avocatId: string) => {
    const newAvocatIds = formData.avocatIds.includes(avocatId)
      ? formData.avocatIds.filter(id => id !== avocatId)
      : [...formData.avocatIds, avocatId];
    setFormData({ ...formData, avocatIds: newAvocatIds });
  };

  const getUser = (id: string) => users.find(u => u.id === id);
  const getDossier = (id: string) => dossiers.find(d => d.id === id);

  // Filtrer les utilisateurs par rôle
  const juges = users.filter(u => u.role === "juge");
  const procureurs = users.filter(u => u.role === "procureur");
  const avocats = users.filter(u => u.role === "avocat");
  const justiciables = users.filter(u => u.role === "justiciable");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Alerte sur les droits d'accès */}
        <Alert>
          <Lock className="h-4 w-4" />
          <AlertDescription>
            {permissions?.canViewAllAudiences 
              ? "Vous avez accès à toutes les audiences du système."
              : `Vous voyez uniquement les audiences qui vous concernent (${accessibleAudiences.length} audience${accessibleAudiences.length > 1 ? 's' : ''}).`
            }
          </AlertDescription>
        </Alert>

        <Card className="shadow-md border-0">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Calendar className="w-6 h-6" />
                Gestion des audiences
              </CardTitle>
              {canCreateAudience && (
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="shadow-gold hover:shadow-gold" onClick={() => {
                      setEditingAudience(null);
                      resetForm();
                    }}>
                      <Plus className="w-5 h-5 mr-2" />
                      Nouvelle audience
                    </Button>
                  </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingAudience ? "Modifier l'audience" : "Créer une nouvelle audience"}
                    </DialogTitle>
                    <DialogDescription>
                      Remplissez les informations de l'audience
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Sélection du dossier - OBLIGATOIRE pour nouvelle audience */}
                    {!editingAudience && (
                      <div className="space-y-2 p-4 bg-primary/5 rounded-lg border-2 border-primary/20">
                        <Label className="text-base font-semibold flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Dossier associé *
                        </Label>
                        <p className="text-sm text-muted-foreground mb-2">
                          Sélectionnez un dossier pour importer automatiquement les parties concernées.
                        </p>
                        <Select
                          value={formData.dossierId || "__none__"}
                          onValueChange={handleDossierChange}
                        >
                          <SelectTrigger className={!formData.dossierId ? "border-destructive" : ""}>
                            <SelectValue placeholder="Sélectionner un dossier" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__">-- Sélectionner un dossier --</SelectItem>
                            {dossiersDisponibles.map((dossier) => {
                              const justiciable = users.find(u => u.id === dossier.justiciableId);
                              return (
                                <SelectItem key={dossier.id} value={dossier.id}>
                                  {dossier.numero} - {dossier.titre} 
                                  {justiciable && ` (${justiciable.prenom} ${justiciable.nom})`}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        {dossiersDisponibles.length === 0 && (
                          <Alert className="mt-2">
                            <AlertDescription>
                              Aucun dossier disponible. Veuillez d'abord créer un dossier avec un justiciable.
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    )}

                    {/* Champs de base toujours visibles */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>N° Audience *</Label>
                        <Input
                          required
                          value={formData.numero}
                          onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                          placeholder="AUD-2025-001"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Statut</Label>
                        <Select
                          value={formData.statut}
                          onValueChange={(value: Audience["statut"]) => setFormData({ ...formData, statut: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(statutLabels).map(([key, { label }]) => (
                              <SelectItem key={key} value={key}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Date *</Label>
                        <Input
                          required
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Heure *</Label>
                        <Input
                          required
                          type="time"
                          value={formData.heure}
                          onChange={(e) => setFormData({ ...formData, heure: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Champs des parties - Affichés seulement après sélection du dossier */}
                    {(formData.dossierId || editingAudience) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4 pt-4 border-t"
                      >
                        <Alert className="bg-green-50 border-green-200">
                          <Users className="w-4 h-4 text-green-600" />
                          <AlertDescription className="text-green-800">
                            {editingAudience 
                              ? "Informations des parties de l'audience" 
                              : "Parties importées du dossier : les informations ci-dessous sont automatiquement remplies."
                            }
                          </AlertDescription>
                        </Alert>

                        <div className="space-y-2">
                          <Label>Parties concernées {formData.dossierId && !editingAudience && <Badge variant="secondary" className="ml-2 text-xs">Auto</Badge>}</Label>
                          <Input
                            required
                            value={formData.parties}
                            onChange={(e) => setFormData({ ...formData, parties: e.target.value })}
                            placeholder={formData.dossierId ? "Importé du dossier" : "Diallo vs Sarr"}
                            readOnly={!!formData.dossierId && !editingAudience}
                            className={formData.dossierId && !editingAudience ? "bg-muted" : ""}
                          />
                        </div>
                      </motion.div>
                    )}

                    {/* Message d'attente si pas de dossier sélectionné */}
                    {!formData.dossierId && !editingAudience && (
                      <Alert className="border-dashed border-2">
                        <FileText className="w-4 h-4" />
                        <AlertDescription>
                          Sélectionnez un dossier ci-dessus pour afficher les champs des parties concernées.
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {/* Sélection de salle avec disponibilité - Toujours visible */}
                    <div className="space-y-2">
                      <Label>Salle * <span className="text-xs text-muted-foreground">(sélectionnez date/heure pour voir la disponibilité)</span></Label>
                      <Select
                        value={formData.salle}
                        onValueChange={(value) => setFormData({ ...formData, salle: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une salle" />
                        </SelectTrigger>
                        <SelectContent>
                          {["Salle 1", "Salle 2", "Salle 3", "Salle 4", "Salle 5", "Grande Salle"].map((salle) => {
                            const isOccupied = formData.date && formData.heure && audiences.some(a => 
                              a.salle === salle && 
                              a.date === formData.date && 
                              a.heure === formData.heure &&
                              a.id !== editingAudience?.id
                            );
                            return (
                              <SelectItem 
                                key={salle} 
                                value={salle}
                                disabled={isOccupied}
                                className={isOccupied ? "text-destructive" : ""}
                              >
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${isOccupied ? 'bg-destructive' : 'bg-green-500'}`} />
                                  {salle} {isOccupied && "(Occupée)"}
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      {formData.date && formData.heure && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-green-500" /> Disponible
                          <span className="w-2 h-2 rounded-full bg-destructive ml-2" /> Occupée
                        </p>
                      )}
                    </div>

                    {/* Champs des intervenants - Affichés seulement après sélection du dossier */}
                    {(formData.dossierId || editingAudience) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="space-y-4"
                      >
                        <div className="space-y-2">
                          <Label>Juge * {formData.dossierId && !editingAudience && <Badge variant="secondary" className="ml-2 text-xs">Hérité</Badge>}</Label>
                          <Select
                            required
                            value={formData.jugeId}
                            onValueChange={(value) => setFormData({ ...formData, jugeId: value })}
                            disabled={!!formData.dossierId && !!formData.jugeId && !editingAudience}
                          >
                            <SelectTrigger className={formData.dossierId && formData.jugeId && !editingAudience ? "bg-muted" : ""}>
                              <SelectValue placeholder="Sélectionner un juge" />
                            </SelectTrigger>
                            <SelectContent>
                              {juges.map((juge) => (
                                <SelectItem key={juge.id} value={juge.id}>
                                  {juge.prenom} {juge.nom} - {juge.tribunal}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Procureur {formData.dossierId && formData.procureurId && !editingAudience && <Badge variant="secondary" className="ml-2 text-xs">Hérité</Badge>}</Label>
                          <Select
                            value={formData.procureurId || "__none__"}
                            onValueChange={(value) => setFormData({ ...formData, procureurId: value === "__none__" ? "" : value })}
                            disabled={!!formData.dossierId && !!formData.procureurId && !editingAudience}
                          >
                            <SelectTrigger className={formData.dossierId && formData.procureurId && !editingAudience ? "bg-muted" : ""}>
                              <SelectValue placeholder="Sélectionner un procureur (optionnel)" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__none__">Aucun</SelectItem>
                              {procureurs.map((procureur) => (
                                <SelectItem key={procureur.id} value={procureur.id}>
                                  {procureur.prenom} {procureur.nom} - {procureur.tribunal}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Avocat(s) {formData.dossierId && formData.avocatIds.length > 0 && !editingAudience && <Badge variant="secondary" className="ml-2 text-xs">Hérités</Badge>}</Label>
                          <div className={`border rounded-md p-3 space-y-2 max-h-32 overflow-y-auto ${formData.dossierId && formData.avocatIds.length > 0 && !editingAudience ? "bg-muted" : ""}`}>
                            {avocats.map((avocat) => (
                              <div key={avocat.id} className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  id={`avocat-${avocat.id}`}
                                  checked={formData.avocatIds.includes(avocat.id)}
                                  onChange={() => handleAvocatToggle(avocat.id)}
                                  className="w-4 h-4"
                                  disabled={!!formData.dossierId && formData.avocatIds.length > 0 && !editingAudience}
                                />
                                <label htmlFor={`avocat-${avocat.id}`} className="text-sm cursor-pointer">
                                  {avocat.prenom} {avocat.nom} - {avocat.tribunal}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Justiciable {formData.dossierId && !editingAudience && <Badge variant="secondary" className="ml-2 text-xs">Hérité</Badge>}</Label>
                          <Select
                            value={formData.justiciableId || "__none__"}
                            onValueChange={(value) => setFormData({ ...formData, justiciableId: value === "__none__" ? "" : value })}
                            disabled={!!formData.dossierId && !editingAudience}
                          >
                            <SelectTrigger className={formData.dossierId && !editingAudience ? "bg-muted" : ""}>
                              <SelectValue placeholder="Sélectionner un justiciable" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__none__">Aucun</SelectItem>
                              {justiciables.map((justiciable) => (
                                <SelectItem key={justiciable.id} value={justiciable.id}>
                                  {justiciable.prenom} {justiciable.nom}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </motion.div>
                    )}

                    <DialogFooter>
                      <Button type="submit" className="w-full" disabled={!editingAudience && !formData.dossierId}>
                        {editingAudience ? "Mettre à jour" : "Créer l'audience"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filtres */}
            <Card className="border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    Filtres
                  </span>
                  {(filters.date || filters.jugeId || filters.avocatId || filters.statut) && (
                    <Button variant="ghost" size="sm" onClick={resetFilters}>
                      <X className="w-4 h-4 mr-2" />
                      Réinitialiser
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={filters.date}
                      onChange={(e) => setFilters({ ...filters, date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Juge</Label>
                    <Select
                      value={filters.jugeId || "__all__"}
                      onValueChange={(value) => setFilters({ ...filters, jugeId: value === "__all__" ? "" : value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tous les juges" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__all__">Tous</SelectItem>
                        {juges.map((juge) => (
                          <SelectItem key={juge.id} value={juge.id}>
                            {juge.prenom} {juge.nom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Avocat</Label>
                    <Select
                      value={filters.avocatId || "__all__"}
                      onValueChange={(value) => setFilters({ ...filters, avocatId: value === "__all__" ? "" : value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tous les avocats" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__all__">Tous</SelectItem>
                        {avocats.map((avocat) => (
                          <SelectItem key={avocat.id} value={avocat.id}>
                            {avocat.prenom} {avocat.nom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Statut</Label>
                    <Select
                      value={filters.statut || "__all__"}
                      onValueChange={(value) => setFilters({ ...filters, statut: value === "__all__" ? "" : value as Audience["statut"] })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tous les statuts" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__all__">Tous</SelectItem>
                        {Object.entries(statutLabels).map(([key, { label }]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Rechercher par numéro ou parties..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Liste des audiences */}
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {filteredAudiences.length} audience{filteredAudiences.length > 1 ? 's' : ''} trouvée{filteredAudiences.length > 1 ? 's' : ''}
              </p>
              {filteredAudiences.map((audience, index) => {
                const juge = getUser(audience.jugeId);
                const procureur = audience.procureurId ? getUser(audience.procureurId) : null;
                const dossier = audience.dossierId ? getDossier(audience.dossierId) : null;
                
                return (
                  <motion.div
                    key={audience.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="hover:shadow-md transition-smooth">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-6">
                          <div className="flex-1 space-y-4">
                            <div className="flex items-center gap-4">
                              <div>
                                <h3 className="font-bold text-xl text-primary">
                                  {audience.numero}
                                </h3>
                                <p className="text-lg font-semibold">{audience.parties}</p>
                              </div>
                              <Badge className={`${statutLabels[audience.statut].color} text-white`}>
                                {statutLabels[audience.statut].label}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span>{new Date(audience.date).toLocaleDateString('fr-FR')}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <span>{audience.heure}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-muted-foreground" />
                                <span>{audience.salle}</span>
                              </div>
                            </div>

                            <div className="space-y-2 text-sm">
                              <div className="flex items-start gap-2">
                                <span className="font-semibold min-w-24">Juge:</span>
                                <span>{juge ? `${juge.prenom} ${juge.nom}` : 'N/A'}</span>
                              </div>
                              {procureur && (
                                <div className="flex items-start gap-2">
                                  <span className="font-semibold min-w-24">Procureur:</span>
                                  <span>{procureur.prenom} {procureur.nom}</span>
                                </div>
                              )}
                              {audience.avocatIds.length > 0 && (
                                <div className="flex items-start gap-2">
                                  <span className="font-semibold min-w-24">Avocat(s):</span>
                                  <span>
                                    {audience.avocatIds.map(id => {
                                      const avocat = getUser(id);
                                      return avocat ? `${avocat.prenom} ${avocat.nom}` : '';
                                    }).filter(Boolean).join(', ')}
                                  </span>
                                </div>
                              )}
                              {dossier && (
                                <div className="flex items-start gap-2">
                                  <span className="font-semibold min-w-24">Dossier:</span>
                                  <span>{dossier.numero} - {dossier.titre}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedAudience(audience);
                                setQrDialogOpen(true);
                              }}
                            >
                              <QrCode className="w-4 h-4 mr-2" />
                              QR Code
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedAudience(audience);
                                setHistoryDialogOpen(true);
                              }}
                            >
                              <History className="w-4 h-4 mr-2" />
                              Historique
                            </Button>
                            {(canEditSpecificAudience(audience) || permissions?.canDeleteAudience) && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    Actions
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {canEditSpecificAudience(audience) && (
                                    <DropdownMenuItem onClick={() => handleEdit(audience)}>
                                      <Edit className="w-4 h-4 mr-2" />
                                      Modifier
                                    </DropdownMenuItem>
                                  )}
                                  {permissions?.canDeleteAudience && (
                                    <DropdownMenuItem onClick={() => handleDelete(audience.id)} className="text-destructive">
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Supprimer
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}

              {filteredAudiences.length === 0 && (
                <Card className="p-12 text-center">
                  <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                  <p className="text-lg text-muted-foreground">
                    Aucune audience trouvée
                  </p>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Dialog QR Code */}
        <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>QR Code - {selectedAudience?.numero}</DialogTitle>
              <DialogDescription>
                Scannez ce code pour accéder aux détails de l'audience
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4 p-6">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <QRCodeSVG
                  value={selectedAudience?.qrCode || ""}
                  size={300}
                  level="H"
                  includeMargin
                />
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm font-semibold">{selectedAudience?.parties}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedAudience && new Date(selectedAudience.date).toLocaleDateString('fr-FR')} à {selectedAudience?.heure}
                </p>
                <p className="text-xs text-muted-foreground break-all">
                  {selectedAudience?.qrCode}
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog Historique */}
        <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Historique - {selectedAudience?.numero}</DialogTitle>
              <DialogDescription>
                Toutes les modifications apportées à cette audience
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {selectedAudience?.historique && selectedAudience.historique.length > 0 ? (
                selectedAudience.historique.map((entry, index) => {
                  const user = getUser(entry.userId);
                  return (
                    <Card key={index} className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <History className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{entry.action}</p>
                          <p className="text-sm text-muted-foreground">
                            Par {user ? `${user.prenom} ${user.nom}` : 'Système'}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(entry.date).toLocaleString('fr-FR')}
                          </p>
                        </div>
                      </div>
                    </Card>
                  );
                })
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Aucun historique disponible
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Audiences;
