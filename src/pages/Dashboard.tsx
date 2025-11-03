import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Filter, MoreVertical, Calendar as CalendarIcon, Clock, MapPin, User, QrCode, Edit2, Trash2, History } from "lucide-react";
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
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import DashboardLayout from "@/components/DashboardLayout";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";
import { QRCodeSVG } from "qrcode.react";

const Dashboard = () => {
  const { audiences, users, addAudience, updateAudience, deleteAudience } = useApp();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("tous");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedAudience, setSelectedAudience] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
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
    statut: "prevue" as "prevue" | "en_cours" | "reportee" | "terminee"
  });

  const getStatusBadge = (statut: "prevue" | "en_cours" | "reportee" | "terminee") => {
    const variants = {
      prevue: { label: "🟢 Prévue", className: "bg-green-500 hover:bg-green-600" },
      en_cours: { label: "🟡 En cours", className: "bg-yellow-500 hover:bg-yellow-600" },
      reportee: { label: "🔵 Reportée", className: "bg-blue-500 hover:bg-blue-600" },
      terminee: { label: "🔴 Terminée", className: "bg-red-500 hover:bg-red-600" }
    };

    const variant = variants[statut];
    return (
      <Badge className={`${variant.className} text-white`}>
        {variant.label}
      </Badge>
    );
  };

  const filteredAudiences = audiences.filter(
    audience => {
      const matchesSearch = audience.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
        audience.parties.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "tous" || audience.statut === statusFilter;
      return matchesSearch && matchesStatus;
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && selectedAudience) {
      updateAudience(selectedAudience.id, formData);
      toast({
        title: "Audience mise à jour",
        description: `L'audience ${formData.numero} a été modifiée.`
      });
    } else {
      addAudience(formData);
      toast({
        title: "Audience créée",
        description: `L'audience ${formData.numero} a été créée avec succès.`
      });
    }
    resetForm();
  };

  const resetForm = () => {
    setDialogOpen(false);
    setIsEditing(false);
    setSelectedAudience(null);
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
      statut: "prevue"
    });
  };

  const handleEdit = (audience: any) => {
    setSelectedAudience(audience);
    setFormData(audience);
    setIsEditing(true);
    setDialogOpen(true);
  };

  const handleDelete = (audienceId: string) => {
    deleteAudience(audienceId);
    toast({
      title: "Audience supprimée",
      description: "L'audience a été supprimée avec succès.",
      variant: "destructive"
    });
  };

  const handleShowQR = (audience: any) => {
    setSelectedAudience(audience);
    setQrDialogOpen(true);
  };

  const handleShowHistory = (audience: any) => {
    setSelectedAudience(audience);
    setHistoryDialogOpen(true);
  };

  const stats = [
    { label: "Total audiences", value: audiences.length, color: "text-primary" },
    { label: "En cours", value: audiences.filter(a => a.statut === "en_cours").length, color: "text-yellow-600" },
    { label: "Prévues", value: audiences.filter(a => a.statut === "prevue").length, color: "text-green-600" },
    { label: "Reportées", value: audiences.filter(a => a.statut === "reportee").length, color: "text-blue-600" }
  ];

  const juges = users.filter(u => u.role === "juge");
  const avocats = users.filter(u => u.role === "avocat");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="gradient-card border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                      <p className={`text-4xl font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-full bg-secondary flex items-center justify-center ${stat.color}`}>
                      <CalendarIcon className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Actions & Search */}
        <Card className="shadow-md border-0">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle className="text-2xl">Gestion des audiences</CardTitle>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="shadow-gold hover:shadow-gold hover:scale-105 transition-smooth">
                    <Plus className="w-5 h-5 mr-2" />
                    Nouvelle audience
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{isEditing ? "Modifier l'audience" : "Créer une nouvelle audience"}</DialogTitle>
                    <DialogDescription>
                      {isEditing ? "Modifiez les informations de l'audience" : "Remplissez les informations de l'audience"}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Numéro d'affaire</Label>
                        <Input 
                          required
                          value={formData.numero}
                          onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                          placeholder="AUD-2025-XXX" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Parties</Label>
                        <Input 
                          required
                          value={formData.parties}
                          onChange={(e) => setFormData({ ...formData, parties: e.target.value })}
                          placeholder="Partie A vs Partie B" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Date</Label>
                        <Input 
                          required
                          type="date" 
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Heure</Label>
                        <Input 
                          required
                          type="time" 
                          value={formData.heure}
                          onChange={(e) => setFormData({ ...formData, heure: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Salle</Label>
                        <Select
                          required
                          value={formData.salle}
                          onValueChange={(value) => setFormData({ ...formData, salle: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Salle 1">Salle 1</SelectItem>
                            <SelectItem value="Salle 2">Salle 2</SelectItem>
                            <SelectItem value="Salle 3">Salle 3</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Juge</Label>
                        <Select
                          required
                          value={formData.jugeId}
                          onValueChange={(value) => setFormData({ ...formData, jugeId: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner" />
                          </SelectTrigger>
                          <SelectContent>
                            {juges.map((juge) => (
                              <SelectItem key={juge.id} value={juge.id}>
                                {juge.prenom} {juge.nom}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button type="submit" className="w-full shadow-gold hover:scale-105 transition-smooth">
                      {isEditing ? "Mettre à jour" : "Créer l'audience"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par numéro ou parties..."
                  className="pl-10 h-11"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[200px] h-11">
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Tous les statuts</SelectItem>
                  <SelectItem value="prevue">🟢 Prévue</SelectItem>
                  <SelectItem value="en_cours">🟡 En cours</SelectItem>
                  <SelectItem value="reportee">🔵 Reportée</SelectItem>
                  <SelectItem value="terminee">🔴 Terminée</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Audiences List */}
            <div className="space-y-4">
              <AnimatePresence>
                {filteredAudiences.map((audience, index) => (
                  <motion.div
                    key={audience.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 20, opacity: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.01 }}
                  >
                    <Card className="hover:shadow-lg transition-smooth border-l-4 border-l-accent overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3 flex-wrap">
                              <h3 className="text-lg font-bold text-primary">{audience.numero}</h3>
                              {getStatusBadge(audience.statut)}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <User className="w-4 h-4" />
                                <span className="font-medium">{audience.parties}</span>
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <CalendarIcon className="w-4 h-4" />
                                <span>{new Date(audience.date).toLocaleDateString('fr-FR')}</span>
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="w-4 h-4" />
                                <span>{audience.heure}</span>
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <MapPin className="w-4 h-4" />
                                <span>{audience.salle} • {users.find(u => u.id === audience.jugeId)?.nom || "Juge"}</span>
                              </div>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="hover:bg-accent/10">
                                <MoreVertical className="w-5 h-5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleShowQR(audience)}>
                                <QrCode className="w-4 h-4 mr-2" />
                                Voir QR Code
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(audience)}>
                                <Edit2 className="w-4 h-4 mr-2" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleShowHistory(audience)}>
                                <History className="w-4 h-4 mr-2" />
                                Historique
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDelete(audience.id)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
              {filteredAudiences.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <p className="text-muted-foreground">Aucune audience trouvée</p>
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* QR Code Dialog */}
        <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>QR Code - {selectedAudience?.numero}</DialogTitle>
              <DialogDescription>
                Scannez ce code pour consulter les détails de l'audience
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center gap-6 py-6">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <QRCodeSVG
                  value={`${window.location.origin}/public-display?audience=${selectedAudience?.id}`}
                  size={256}
                  level="H"
                  includeMargin
                />
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm font-medium">{selectedAudience?.parties}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedAudience?.date && new Date(selectedAudience.date).toLocaleDateString('fr-FR')} à {selectedAudience?.heure}
                </p>
                <p className="text-sm text-muted-foreground">{selectedAudience?.salle}</p>
              </div>
              <Button onClick={() => window.print()} className="w-full">
                Imprimer le QR Code
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* History Dialog */}
        <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Historique - {selectedAudience?.numero}</DialogTitle>
              <DialogDescription>
                Historique des modifications de l'audience
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {selectedAudience?.historique?.map((entry: any, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-4 border-l-2 border-accent pl-4 py-2"
                >
                  <div className="flex-1">
                    <p className="font-medium">{entry.action}</p>
                    <p className="text-sm text-muted-foreground">{entry.details}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(entry.date).toLocaleString('fr-FR')} • {entry.utilisateur}
                    </p>
                  </div>
                </motion.div>
              ))}
              {(!selectedAudience?.historique || selectedAudience.historique.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Aucun historique disponible</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
