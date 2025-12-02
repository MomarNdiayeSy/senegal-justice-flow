import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, FileText, Upload, Download, Eye, MoreVertical, Trash2, History, Calendar, FolderOpen, File, Filter, SortAsc, Lock, Unlock, Archive, Users, GitBranch, AlertCircle, FileVideo, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { Checkbox } from "@/components/ui/checkbox";
import DashboardLayout from "@/components/DashboardLayout";
import { useApp, Dossier } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";
import { usePermissions } from "@/hooks/usePermissions";

const Dossiers = () => {
  const { dossiers, audiences, users, addDossier, updateDossier, currentUser } = useApp();
  const { toast } = useToast();
  const { 
    canCreateDossier, 
    canAccessDossier, 
    canEditSpecificDossier,
    getAccessibleDossiers,
    permissions 
  } = usePermissions();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("tous");
  const [sortBy, setSortBy] = useState<string>("date_desc");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [accessDialogOpen, setAccessDialogOpen] = useState(false);
  const [versionDialogOpen, setVersionDialogOpen] = useState(false);
  const [addFileDialogOpen, setAddFileDialogOpen] = useState(false);
  const [selectedDossier, setSelectedDossier] = useState<Dossier | null>(null);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [formData, setFormData] = useState({
    numero: "",
    titre: "",
    description: "",
    statut: "en_cours" as Dossier["statut"],
    audienceId: "",
    pieces: [] as any[],
    accessList: [] as string[]
  });

  // Auto-archivage des dossiers clos depuis plus de 30 jours
  useEffect(() => {
    const checkArchivage = () => {
      const now = new Date();
      dossiers.forEach(dossier => {
        if (dossier.statut === "clos") {
          const dateCreation = new Date(dossier.dateCreation);
          const diffDays = Math.floor((now.getTime() - dateCreation.getTime()) / (1000 * 60 * 60 * 24));
          
          if (diffDays > 30) {
            updateDossier(dossier.id, { statut: "archive" });
            toast({
              title: "📁 Archivage automatique",
              description: `Le dossier ${dossier.numero} a été archivé automatiquement après 30 jours.`
            });
          }
        }
      });
    };

    const interval = setInterval(checkArchivage, 60000); // Vérifier toutes les minutes
    return () => clearInterval(interval);
  }, [dossiers]);

  const statutColors = {
    ouvert: "bg-purple-500 hover:bg-purple-600",
    en_cours: "bg-blue-500 hover:bg-blue-600",
    clos: "bg-green-500 hover:bg-green-600",
    archive: "bg-gray-500 hover:bg-gray-600"
  };

  const statutLabels = {
    ouvert: "Ouvert",
    en_cours: "En cours",
    clos: "Clos",
    archive: "Archivé"
  };

  const getFileIcon = (filename: string, type?: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return <FileText className="w-5 h-5 text-red-500" />;
    if (ext === 'docx' || ext === 'doc') return <FileText className="w-5 h-5 text-blue-500" />;
    if (ext === 'jpg' || ext === 'png' || ext === 'jpeg') return <ImageIcon className="w-5 h-5 text-green-500" />;
    if (ext === 'mp4' || ext === 'avi' || ext === 'mov') return <FileVideo className="w-5 h-5 text-purple-500" />;
    return <File className="w-5 h-5 text-muted-foreground" />;
  };

  const sortDossiers = (dossiersToSort: Dossier[]) => {
    switch (sortBy) {
      case "date_desc":
        return [...dossiersToSort].sort((a, b) => new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime());
      case "date_asc":
        return [...dossiersToSort].sort((a, b) => new Date(a.dateCreation).getTime() - new Date(b.dateCreation).getTime());
      case "numero":
        return [...dossiersToSort].sort((a, b) => a.numero.localeCompare(b.numero));
      default:
        return dossiersToSort;
    }
  };

  // Utiliser les permissions pour filtrer les dossiers accessibles
  const accessibleDossiers = getAccessibleDossiers();

  const filteredDossiers = sortDossiers(
    accessibleDossiers.filter(dossier => {
      const matchesSearch = dossier.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dossier.titre.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "tous" || dossier.statut === statusFilter;
      return matchesSearch && matchesStatus;
    })
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ajouter l'utilisateur actuel dans la liste d'accès
    const finalFormData: Omit<Dossier, "id" | "dateCreation"> = {
      ...formData,
      accessList: currentUser ? [currentUser.id, ...formData.accessList] : formData.accessList,
      historique: []
    };
    
    addDossier(finalFormData);
    toast({
      title: "✓ Dossier créé",
      description: `Le dossier ${formData.numero} a été créé avec succès.`
    });
    setDialogOpen(false);
    setFormData({
      numero: "",
      titre: "",
      description: "",
      statut: "en_cours",
      audienceId: "",
      pieces: [],
      accessList: []
    });
  };

  const handleFileUpload = (files: FileList | null, dossierId?: string) => {
    if (!files) return;
    
    setUploadProgress(0);
    const newPieces = Array.from(files).map(file => ({
      id: Date.now().toString() + Math.random(),
      nom: file.name,
      type: file.type,
      taille: (file.size / 1024 / 1024).toFixed(2) + " MB",
      dateAjout: new Date().toISOString(),
      ajoutePar: currentUser?.id || "system",
      version: 1,
      historique: [
        {
          version: 1,
          date: new Date().toISOString(),
          action: "Version initiale",
          userId: currentUser?.id || "system"
        }
      ]
    }));

    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        
        if (dossierId) {
          // Ajouter à un dossier existant
          const dossier = dossiers.find(d => d.id === dossierId);
          if (dossier) {
            updateDossier(dossierId, {
              pieces: [...dossier.pieces, ...newPieces]
            });
          }
          setAddFileDialogOpen(false);
        } else {
          // Ajouter au formulaire de création
          setFormData({ ...formData, pieces: [...formData.pieces, ...newPieces] });
        }
        
        toast({
          title: "✓ Fichier(s) ajouté(s)",
          description: `${newPieces.length} fichier(s) téléversé(s) avec succès.`
        });
        setTimeout(() => setUploadProgress(0), 1000);
      }
    }, 200);
  };

  const handleNewVersion = (piece: any) => {
    const newVersion = piece.version + 1;
    const updatedPiece = {
      ...piece,
      version: newVersion,
      dateAjout: new Date().toISOString(),
      historique: [
        ...piece.historique,
        {
          version: newVersion,
          date: new Date().toISOString(),
          action: `Nouvelle version ${newVersion}`,
          userId: currentUser?.id || "system"
        }
      ]
    };

    if (selectedDossier) {
      const updatedPieces = selectedDossier.pieces.map(p => 
        p.id === piece.id ? updatedPiece : p
      );
      updateDossier(selectedDossier.id, { pieces: updatedPieces });
      setSelectedDossier({ ...selectedDossier, pieces: updatedPieces });
      toast({
        title: "✓ Nouvelle version créée",
        description: `Version ${newVersion} du fichier ${piece.nom} créée.`
      });
    }
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

  const handleViewDossier = (dossier: Dossier) => {
    if (!canAccessDossier(dossier)) {
      toast({
        title: "❌ Accès refusé",
        description: "Vous n'avez pas les droits pour consulter ce dossier.",
        variant: "destructive"
      });
      return;
    }
    setSelectedDossier(dossier);
    setViewDialogOpen(true);
  };

  const handleShowHistory = (dossier: Dossier) => {
    setSelectedDossier(dossier);
    setHistoryDialogOpen(true);
  };

  const handleManageAccess = (dossier: Dossier) => {
    setSelectedDossier(dossier);
    setAccessDialogOpen(true);
  };

  const handleAccessToggle = (userId: string) => {
    if (!selectedDossier) return;
    
    const newAccessList = selectedDossier.accessList.includes(userId)
      ? selectedDossier.accessList.filter(id => id !== userId)
      : [...selectedDossier.accessList, userId];
    
    updateDossier(selectedDossier.id, { accessList: newAccessList });
    setSelectedDossier({ ...selectedDossier, accessList: newAccessList });
  };

  const handleChangeStatus = (dossierId: string, newStatus: Dossier["statut"]) => {
    updateDossier(dossierId, { statut: newStatus });
    toast({
      title: "✓ Statut modifié",
      description: `Le dossier a été marqué comme ${statutLabels[newStatus]}.`
    });
  };

  const stats = [
    { label: "Total dossiers", value: accessibleDossiers.length, color: "text-primary", icon: FolderOpen },
    { label: "En cours", value: accessibleDossiers.filter(d => d.statut === "en_cours").length, color: "text-blue-600", icon: File },
    { label: "Clos", value: accessibleDossiers.filter(d => d.statut === "clos").length, color: "text-green-600", icon: FileText },
    { label: "Archivés", value: accessibleDossiers.filter(d => d.statut === "archive").length, color: "text-gray-600", icon: Archive }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Info sur les droits d'accès */}
        <Alert>
          <Lock className="h-4 w-4" />
          <AlertDescription>
            {permissions?.canViewAllDossiers 
              ? "Vous avez accès à tous les dossiers du système."
              : `Vous voyez uniquement les dossiers qui vous concernent (${accessibleDossiers.length} dossier${accessibleDossiers.length > 1 ? 's' : ''}).`
            }
          </AlertDescription>
        </Alert>

        {/* Info archivage automatique */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Les dossiers clos sont automatiquement archivés après 30 jours.
          </AlertDescription>
        </Alert>

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
                Gestion des dossiers judiciaires
              </CardTitle>
              {canCreateDossier && (
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
                      Enregistrement numérique du dossier avec gestion des accès
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Numéro de dossier *</Label>
                        <Input
                          required
                          value={formData.numero}
                          onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                          placeholder="DOS-2025-XXX"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Statut</Label>
                        <Select
                          value={formData.statut}
                          onValueChange={(value: Dossier["statut"]) => setFormData({ ...formData, statut: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(statutLabels).map(([key, label]) => (
                              <SelectItem key={key} value={key}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Titre *</Label>
                      <Input
                        required
                        value={formData.titre}
                        onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                        placeholder="Titre du dossier"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Description *</Label>
                      <Textarea
                        required
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Description détaillée de l'affaire"
                        rows={4}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Audience liée</Label>
                      <Select
                        value={formData.audienceId || "__none__"}
                        onValueChange={(value) => setFormData({ ...formData, audienceId: value === "__none__" ? "" : value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner (optionnel)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">Aucune</SelectItem>
                          {audiences.map((audience) => (
                            <SelectItem key={audience.id} value={audience.id}>
                              {audience.numero} - {audience.parties}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Gestion des accès</Label>
                      <div className="border rounded-md p-3 space-y-2 max-h-48 overflow-y-auto">
                        {users.filter(u => u.id !== currentUser?.id).map((user) => (
                          <div key={user.id} className="flex items-center gap-2">
                            <Checkbox
                              id={`access-${user.id}`}
                              checked={formData.accessList.includes(user.id)}
                              onCheckedChange={() => {
                                const newAccessList = formData.accessList.includes(user.id)
                                  ? formData.accessList.filter(id => id !== user.id)
                                  : [...formData.accessList, user.id];
                                setFormData({ ...formData, accessList: newAccessList });
                              }}
                            />
                            <label htmlFor={`access-${user.id}`} className="text-sm cursor-pointer flex-1">
                              {user.prenom} {user.nom} ({user.role})
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Pièces jointes (PDF, Images, Vidéos)</Label>
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
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.mp4,.avi,.mov"
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
                              PDF, DOCX, Images, Vidéos acceptés (max 20 MB)
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
                              {getFileIcon(piece.nom, piece.type)}
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{piece.nom}</p>
                                <p className="text-xs text-muted-foreground">{piece.taille} • v{piece.version}</p>
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

                    <DialogFooter>
                      <Button type="submit" className="w-full shadow-gold hover:scale-105 transition-smooth">
                        Créer le dossier
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
              )}
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
                  <SelectItem value="ouvert">📂 Ouvert</SelectItem>
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
                {filteredDossiers.map((dossier, index) => {
                  const canEdit = canEditSpecificDossier(dossier);
                  const audience = dossier.audienceId ? audiences.find(a => a.id === dossier.audienceId) : null;
                  
                  return (
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
                                <h3 className="font-bold text-lg mb-1 text-primary truncate flex items-center gap-2">
                                  {dossier.numero}
                                  {!canEdit && <Lock className="w-4 h-4 text-muted-foreground" />}
                                </h3>
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
                                  <DropdownMenuItem onClick={() => {
                                    setSelectedDossier(dossier);
                                    setAddFileDialogOpen(true);
                                  }}>
                                    <Upload className="w-4 h-4 mr-2" />
                                    Ajouter fichier
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleShowHistory(dossier)}>
                                    <History className="w-4 h-4 mr-2" />
                                    Historique
                                  </DropdownMenuItem>
                                  {(currentUser?.role === "admin" || currentUser?.role === "greffier") && (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem onClick={() => handleManageAccess(dossier)}>
                                        <Users className="w-4 h-4 mr-2" />
                                        Gérer accès
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleChangeStatus(dossier.id, "clos")}>
                                        <FileText className="w-4 h-4 mr-2" />
                                        Clore
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleChangeStatus(dossier.id, "archive")}>
                                        <Archive className="w-4 h-4 mr-2" />
                                        Archiver
                                      </DropdownMenuItem>
                                    </>
                                  )}
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
                              {audience && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Users className="w-4 h-4" />
                                  <span className="truncate">{audience.numero}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                {canEdit ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                                <span>{dossier.accessList.length} utilisateur(s)</span>
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
                  );
                })}
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
                <p className="text-sm text-muted-foreground mt-2">Créez un nouveau dossier ou ajustez vos filtres</p>
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
                Détails complets du dossier judiciaire avec gestion des versions
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Statut</p>
                  <Badge className={`${statutColors[selectedDossier?.statut || "en_cours"]} text-white`}>
                    {statutLabels[selectedDossier?.statut || "en_cours"]}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Date de création</p>
                  <p className="text-sm">
                    {selectedDossier?.dateCreation && new Date(selectedDossier.dateCreation).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Accès</p>
                  <p className="text-sm flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {selectedDossier?.accessList.length} utilisateur(s)
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
                <p className="text-sm bg-muted p-4 rounded-lg">{selectedDossier?.description}</p>
              </div>

              <Separator />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Pièces jointes ({selectedDossier?.pieces?.length || 0})
                  </p>
                  <Button size="sm" variant="outline" onClick={() => setAddFileDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter
                  </Button>
                </div>
                <div className="space-y-2">
                  {selectedDossier?.pieces?.map((piece: any) => (
                    <motion.div
                      key={piece.id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      className="flex items-center gap-4 p-4 bg-secondary rounded-lg hover:bg-secondary/80 transition-smooth"
                    >
                      {getFileIcon(piece.nom, piece.type)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate flex items-center gap-2">
                          {piece.nom}
                          <Badge variant="outline" className="text-xs">
                            <GitBranch className="w-3 h-3 mr-1" />
                            v{piece.version}
                          </Badge>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {piece.taille} • Ajouté le {new Date(piece.dateAjout).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedFile(piece);
                            setVersionDialogOpen(true);
                          }}
                        >
                          <GitBranch className="w-4 h-4 mr-1" />
                          Versions
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleNewVersion(piece)}
                        >
                          <Upload className="w-4 h-4 mr-1" />
                          Nouvelle version
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

        {/* Version History Dialog */}
        <Dialog open={versionDialogOpen} onOpenChange={setVersionDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <GitBranch className="w-5 h-5" />
                Historique des versions - {selectedFile?.nom}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-4">
              {selectedFile?.historique?.map((version: any, index: number) => {
                const user = users.find(u => u.id === version.userId);
                return (
                  <Card key={index} className="p-4">
                    <div className="flex items-start gap-3">
                      <Badge variant="outline" className="mt-1">v{version.version}</Badge>
                      <div className="flex-1">
                        <p className="font-medium">{version.action}</p>
                        <p className="text-sm text-muted-foreground">
                          Par {user ? `${user.prenom} ${user.nom}` : 'Système'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(version.date).toLocaleString('fr-FR')}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                );
              })}
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
                Historique complet des modifications du dossier
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {selectedDossier?.historique?.map((entry: any, index: number) => {
                const user = users.find(u => u.id === entry.userId);
                return (
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
                        {new Date(entry.date).toLocaleString('fr-FR')} • {user ? `${user.prenom} ${user.nom}` : 'Système'}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
              {(!selectedDossier?.historique || selectedDossier.historique.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Aucun historique disponible</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Access Management Dialog */}
        <Dialog open={accessDialogOpen} onOpenChange={setAccessDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Gestion des accès - {selectedDossier?.numero}
              </DialogTitle>
              <DialogDescription>
                Contrôlez qui peut consulter ce dossier
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4">
              {users.map((user) => {
                const hasAccess = selectedDossier?.accessList.includes(user.id);
                return (
                  <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-bold">
                        {user.prenom[0]}{user.nom[0]}
                      </div>
                      <div>
                        <p className="font-medium">{user.prenom} {user.nom}</p>
                        <p className="text-xs text-muted-foreground">{user.role}</p>
                      </div>
                    </div>
                    <Checkbox
                      checked={hasAccess}
                      onCheckedChange={() => handleAccessToggle(user.id)}
                    />
                  </div>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>

        {/* Add File Dialog */}
        <Dialog open={addFileDialogOpen} onOpenChange={setAddFileDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter des fichiers</DialogTitle>
              <DialogDescription>
                Téléversez de nouveaux documents au dossier {selectedDossier?.numero}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div 
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                  isDragging ? 'border-accent bg-accent/10 scale-105' : 'border-border hover:border-accent'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  handleFileUpload(e.dataTransfer.files, selectedDossier?.id);
                }}
              >
                <Input
                  type="file"
                  multiple
                  onChange={(e) => handleFileUpload(e.target.files, selectedDossier?.id)}
                  className="hidden"
                  id="add-file-upload"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.mp4,.avi,.mov"
                />
                <label htmlFor="add-file-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-base font-medium mb-1">
                    {isDragging ? 'Déposez les fichiers ici' : 'Glissez-déposez vos fichiers'}
                  </p>
                  <p className="text-sm text-muted-foreground">ou cliquez pour parcourir</p>
                </label>
              </div>
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mt-4 space-y-2">
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-sm text-center text-muted-foreground">
                    Téléversement en cours... {uploadProgress}%
                  </p>
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
