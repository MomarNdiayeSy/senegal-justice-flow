import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, FileText, Upload, Download, Eye, MoreVertical, Trash2, History, Calendar, FolderOpen, File, Filter, SortAsc } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import DashboardLayout from "@/components/DashboardLayout";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";

const Dossiers = () => {
  const { dossiers, audiences, addDossier, updateDossier, currentUser } = useApp();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("tous");
  const [sortBy, setSortBy] = useState<string>("date_desc");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedDossier, setSelectedDossier] = useState<any>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [formData, setFormData] = useState({
    numero: "",
    titre: "",
    description: "",
    statut: "en_cours" as "en_cours" | "clos" | "archive",
    audienceId: "",
    pieces: [] as any[]
  });

  const statutColors = {
    en_cours: "bg-blue-500 hover:bg-blue-600",
    clos: "bg-green-500 hover:bg-green-600",
    archive: "bg-gray-500 hover:bg-gray-600"
  };

  const statutLabels = {
    en_cours: "En cours",
    clos: "Clos",
    archive: "Archivé"
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    return ext === 'pdf' ? '📄' : ext === 'docx' || ext === 'doc' ? '📝' : ext === 'jpg' || ext === 'png' ? '🖼️' : '📎';
  };

  const sortDossiers = (dossiers: any[]) => {
    switch (sortBy) {
      case "date_desc":
        return [...dossiers].sort((a, b) => new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime());
      case "date_asc":
        return [...dossiers].sort((a, b) => new Date(a.dateCreation).getTime() - new Date(b.dateCreation).getTime());
      case "numero":
        return [...dossiers].sort((a, b) => a.numero.localeCompare(b.numero));
      default:
        return dossiers;
    }
  };

  const filteredDossiers = sortDossiers(
    dossiers.filter(dossier => {
      const matchesSearch = dossier.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dossier.titre.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "tous" || dossier.statut === statusFilter;
      return matchesSearch && matchesStatus;
    })
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addDossier(formData);
    toast({
      title: "Dossier créé",
      description: `Le dossier ${formData.numero} a été créé avec succès.`
    });
    setDialogOpen(false);
    setFormData({
      numero: "",
      titre: "",
      description: "",
      statut: "en_cours",
      audienceId: "",
      pieces: []
    });
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    
    setUploadProgress(0);
    const newPieces = Array.from(files).map(file => ({
      id: Date.now().toString() + Math.random(),
      nom: file.name,
      type: file.type,
      taille: (file.size / 1024 / 1024).toFixed(2) + " MB",
      dateAjout: new Date().toISOString(),
      ajoutePar: currentUser?.nom || "Utilisateur"
    }));

    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setFormData({ ...formData, pieces: [...formData.pieces, ...newPieces] });
        toast({
          title: "Fichier(s) ajouté(s)",
          description: `${newPieces.length} fichier(s) ajouté(s) au dossier.`
        });
        setTimeout(() => setUploadProgress(0), 1000);
      }
    }, 200);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  }, [formData]);

  const handleViewDossier = (dossier: any) => {
    setSelectedDossier(dossier);
    setViewDialogOpen(true);
  };

  const handleShowHistory = (dossier: any) => {
    setSelectedDossier(dossier);
    setHistoryDialogOpen(true);
  };

  const stats = [
    { label: "Total dossiers", value: dossiers.length, color: "text-primary", icon: FolderOpen },
    { label: "En cours", value: dossiers.filter(d => d.statut === "en_cours").length, color: "text-blue-600", icon: File },
    { label: "Clos", value: dossiers.filter(d => d.statut === "clos").length, color: "text-green-600", icon: FileText },
    { label: "Archivés", value: dossiers.filter(d => d.statut === "archive").length, color: "text-gray-600", icon: History }
  ];

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
              <Card className="gradient-card border-0 shadow-md hover:shadow-lg transition-smooth">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                      <p className={`text-4xl font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-full bg-secondary flex items-center justify-center ${stat.color}`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Card className="shadow-md border-0">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle className="text-2xl flex items-center gap-2">
                <FolderOpen className="w-7 h-7 text-primary" />
                Gestion des dossiers
              </CardTitle>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="shadow-gold hover:shadow-gold hover:scale-105 transition-smooth">
                    <Plus className="w-5 h-5 mr-2" />
                    Nouveau dossier
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Créer un nouveau dossier judiciaire</DialogTitle>
                    <DialogDescription>
                      Enregistrez un nouveau dossier avec les pièces jointes
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Numéro de dossier</Label>
                        <Input
                          required
                          value={formData.numero}
                          onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                          placeholder="DOS-2025-XXX"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Audience liée</Label>
                        <Select
                          value={formData.audienceId}
                          onValueChange={(value) => setFormData({ ...formData, audienceId: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner (optionnel)" />
                          </SelectTrigger>
                          <SelectContent>
                            {audiences.map((audience) => (
                              <SelectItem key={audience.id} value={audience.id}>
                                {audience.numero} - {audience.parties}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Titre</Label>
                      <Input
                        required
                        value={formData.titre}
                        onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                        placeholder="Titre du dossier"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        required
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Description détaillée de l'affaire"
                        rows={4}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Pièces jointes</Label>
                      <div 
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                          isDragging ? 'border-accent bg-accent/10 scale-105' : 'border-border hover:border-accent'
                        }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                      >
                        <Input
                          type="file"
                          multiple
                          onChange={(e) => handleFileUpload(e.target.files)}
                          className="hidden"
                          id="file-upload"
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        />
                        <label htmlFor="file-upload" className="cursor-pointer">
                          <motion.div
                            animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Upload className="w-16 h-16 mx-auto mb-3 text-muted-foreground" />
                            <p className="text-base font-medium mb-1">
                              {isDragging ? 'Déposez les fichiers ici' : 'Glissez-déposez vos fichiers'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              ou cliquez pour parcourir
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              PDF, DOCX, images acceptés (max 20 MB)
                            </p>
                          </motion.div>
                        </label>
                      </div>
                      
                      {uploadProgress > 0 && uploadProgress < 100 && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="space-y-2"
                        >
                          <Progress value={uploadProgress} className="h-2" />
                          <p className="text-sm text-center text-muted-foreground">
                            Téléversement en cours... {uploadProgress}%
                          </p>
                        </motion.div>
                      )}
                      
                      {formData.pieces.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-4 space-y-2"
                        >
                          <p className="text-sm font-medium">{formData.pieces.length} fichier(s) ajouté(s)</p>
                          {formData.pieces.map((piece) => (
                            <motion.div
                              key={piece.id}
                              initial={{ x: -20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              className="flex items-center gap-3 text-sm p-3 bg-secondary rounded-lg hover:bg-secondary/80 transition-smooth"
                            >
                              <span className="text-2xl">{getFileIcon(piece.nom)}</span>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{piece.nom}</p>
                                <p className="text-xs text-muted-foreground">{piece.taille}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setFormData({
                                  ...formData,
                                  pieces: formData.pieces.filter(p => p.id !== piece.id)
                                })}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </div>

                    <Button type="submit" className="w-full shadow-gold hover:scale-105 transition-smooth">
                      Créer le dossier
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
                  placeholder="Rechercher par numéro ou titre..."
                  className="pl-10 h-11"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px] h-11">
                  <SelectValue placeholder="Filtrer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Tous les statuts</SelectItem>
                  <SelectItem value="en_cours">📘 En cours</SelectItem>
                  <SelectItem value="clos">📗 Clos</SelectItem>
                  <SelectItem value="archive">📕 Archivé</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-[180px] h-11">
                  <SelectValue placeholder="Trier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date_desc">Plus récent</SelectItem>
                  <SelectItem value="date_asc">Plus ancien</SelectItem>
                  <SelectItem value="numero">Par numéro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredDossiers.map((dossier, index) => (
                  <motion.div
                    key={dossier.id}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -5, scale: 1.02 }}
                  >
                    <Card className="hover:shadow-xl transition-all h-full border-0 shadow-md overflow-hidden">
                      <div className="h-2 bg-gradient-to-r from-primary to-accent" />
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-lg mb-1 text-primary truncate">{dossier.numero}</h3>
                              <p className="text-muted-foreground text-sm truncate">{dossier.titre}</p>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="hover:bg-accent/10 shrink-0">
                                  <MoreVertical className="w-5 h-5" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleViewDossier(dossier)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Consulter
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleShowHistory(dossier)}>
                                  <History className="w-4 h-4 mr-2" />
                                  Historique
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive focus:text-destructive">
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Supprimer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          <Badge className={`${statutColors[dossier.statut]} text-white`}>
                            {statutLabels[dossier.statut]}
                          </Badge>

                          <p className="text-sm line-clamp-2 text-muted-foreground">{dossier.description}</p>

                          <Separator />

                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <FileText className="w-4 h-4" />
                              <span className="font-medium">{dossier.pieces.length} pièce(s) jointe(s)</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(dossier.dateCreation).toLocaleDateString('fr-FR')}</span>
                            </div>
                          </div>

                          <div className="flex gap-2 pt-2">
                            <Button 
                              variant="default" 
                              size="sm" 
                              className="flex-1"
                              onClick={() => handleViewDossier(dossier)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Consulter
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {filteredDossiers.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <FolderOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-lg font-medium text-muted-foreground">Aucun dossier trouvé</p>
                <p className="text-sm text-muted-foreground mt-2">Créez un nouveau dossier pour commencer</p>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* View Dossier Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FolderOpen className="w-6 h-6 text-primary" />
                {selectedDossier?.numero} - {selectedDossier?.titre}
              </DialogTitle>
              <DialogDescription>
                Détails complets du dossier judiciaire
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Statut</p>
                  <Badge className={`${statutColors[selectedDossier?.statut]} text-white`}>
                    {statutLabels[selectedDossier?.statut]}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Date de création</p>
                  <p className="text-sm">
                    {selectedDossier?.dateCreation && new Date(selectedDossier.dateCreation).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
                <p className="text-sm bg-muted p-4 rounded-lg">{selectedDossier?.description}</p>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Pièces jointes ({selectedDossier?.pieces?.length || 0})
                </p>
                <div className="space-y-2">
                  {selectedDossier?.pieces?.map((piece: any) => (
                    <motion.div
                      key={piece.id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      className="flex items-center gap-4 p-4 bg-secondary rounded-lg hover:bg-secondary/80 transition-smooth"
                    >
                      <span className="text-3xl">{getFileIcon(piece.nom)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{piece.nom}</p>
                        <p className="text-xs text-muted-foreground">
                          {piece.taille} • Ajouté le {new Date(piece.dateAjout).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                  {(!selectedDossier?.pieces || selectedDossier.pieces.length === 0) && (
                    <p className="text-sm text-muted-foreground text-center py-8">Aucune pièce jointe</p>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* History Dialog */}
        <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Historique - {selectedDossier?.numero}
              </DialogTitle>
              <DialogDescription>
                Historique des modifications du dossier
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {selectedDossier?.historique?.map((entry: any, index: number) => (
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
              {(!selectedDossier?.historique || selectedDossier.historique.length === 0) && (
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

export default Dossiers;
