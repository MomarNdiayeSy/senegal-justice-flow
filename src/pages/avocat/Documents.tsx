import { useState } from "react";
import { motion } from "framer-motion";
import { Upload, FileText, File, Trash2, Eye, Download, FolderOpen, CheckCircle, AlertCircle, Clock, Search, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useApp, Dossier } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/DashboardLayout";

const AvocatDocuments = () => {
  const { dossiers, currentUser, updateDossier } = useApp();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedDossier, setSelectedDossier] = useState<string>("all");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    dossierId: "",
    nom: "",
    type: "memoire",
    description: ""
  });

  // Dossiers accessibles à l'avocat
  const mesDossiers = dossiers.filter(d => d.accessList.includes(currentUser?.id || ""));

  // Tous les documents de tous les dossiers
  const allDocuments = mesDossiers.flatMap(dossier => 
    dossier.pieces.map(piece => ({
      ...piece,
      dossierId: dossier.id,
      dossierNumero: dossier.numero,
      dossierTitre: dossier.titre
    }))
  );

  const documentTypes = [
    { value: "memoire", label: "Mémoire" },
    { value: "plaidoirie", label: "Plaidoirie" },
    { value: "piece_justificative", label: "Pièce justificative" },
    { value: "conclusion", label: "Conclusions" },
    { value: "attestation", label: "Attestation" },
    { value: "autre", label: "Autre" }
  ];

  const getTypeLabel = (type: string) => {
    const found = documentTypes.find(t => t.value === type);
    return found?.label || type;
  };

  const filteredDocuments = allDocuments.filter(doc => {
    const matchesSearch = doc.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.dossierNumero.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || doc.type === typeFilter;
    const matchesDossier = selectedDossier === "all" || doc.dossierId === selectedDossier;
    return matchesSearch && matchesType && matchesDossier;
  });

  const handleUpload = () => {
    if (!uploadForm.dossierId || !uploadForm.nom) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    const dossier = mesDossiers.find(d => d.id === uploadForm.dossierId);
    if (!dossier) return;

    const newPiece = {
      id: `piece-${Date.now()}`,
      nom: uploadForm.nom,
      type: uploadForm.type,
      taille: "1.2 Mo",
      dateAjout: new Date().toISOString(),
      ajoutePar: currentUser?.id || "",
      version: 1,
      historique: [{
        version: 1,
        date: new Date().toISOString(),
        action: "Création",
        userId: currentUser?.id || ""
      }]
    };

    updateDossier(dossier.id, {
      pieces: [...dossier.pieces, newPiece]
    });

    toast({
      title: "Document téléversé",
      description: `Le document "${uploadForm.nom}" a été ajouté au dossier ${dossier.numero}`
    });

    setUploadForm({ dossierId: "", nom: "", type: "memoire", description: "" });
    setIsUploadOpen(false);
  };

  const stats = {
    total: allDocuments.length,
    memoires: allDocuments.filter(d => d.type === "memoire").length,
    plaidoiries: allDocuments.filter(d => d.type === "plaidoirie").length,
    pieces: allDocuments.filter(d => d.type === "piece_justificative").length
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-primary">Gestion des Documents</h1>
            <p className="text-muted-foreground mt-1">Téléversez et gérez vos documents juridiques</p>
          </div>
          <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogTrigger asChild>
              <Button className="shadow-gold">
                <Upload className="w-4 h-4 mr-2" />
                Téléverser un document
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Téléverser un document
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Dossier *</Label>
                  <Select value={uploadForm.dossierId} onValueChange={(v) => setUploadForm({...uploadForm, dossierId: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un dossier" />
                    </SelectTrigger>
                    <SelectContent>
                      {mesDossiers.map(dossier => (
                        <SelectItem key={dossier.id} value={dossier.id}>
                          {dossier.numero} - {dossier.titre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Nom du document *</Label>
                  <Input
                    placeholder="Ex: Mémoire en défense - Affaire Diallo"
                    value={uploadForm.nom}
                    onChange={(e) => setUploadForm({...uploadForm, nom: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type de document</Label>
                  <Select value={uploadForm.type} onValueChange={(v) => setUploadForm({...uploadForm, type: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {documentTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Description du document..."
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                  />
                </div>
                <div className="border-2 border-dashed border-primary/30 rounded-lg p-6 text-center bg-primary/5">
                  <Upload className="w-10 h-10 text-primary mx-auto mb-2" />
                  <p className="text-sm font-medium">Glissez-déposez votre fichier ici</p>
                  <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, DOC (max 10 Mo)</p>
                  <Button variant="outline" size="sm" className="mt-3">
                    Parcourir
                  </Button>
                </div>
              </div>
              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setIsUploadOpen(false)}>Annuler</Button>
                <Button onClick={handleUpload}>
                  <Upload className="w-4 h-4 mr-2" />
                  Téléverser
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Statistiques */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <Card className="shadow-elegant">
            <CardContent className="p-4 text-center">
              <FileText className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total documents</div>
            </CardContent>
          </Card>
          <Card className="shadow-elegant border-blue-200">
            <CardContent className="p-4 text-center">
              <File className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{stats.memoires}</div>
              <div className="text-sm text-muted-foreground">Mémoires</div>
            </CardContent>
          </Card>
          <Card className="shadow-elegant border-purple-200">
            <CardContent className="p-4 text-center">
              <FileText className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">{stats.plaidoiries}</div>
              <div className="text-sm text-muted-foreground">Plaidoiries</div>
            </CardContent>
          </Card>
          <Card className="shadow-elegant border-green-200">
            <CardContent className="p-4 text-center">
              <FolderOpen className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">{stats.pieces}</div>
              <div className="text-sm text-muted-foreground">Pièces justif.</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Formats acceptés */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card className="shadow-elegant border-amber-200 bg-amber-50/50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-800">Formats acceptés par le tribunal</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    PDF (recommandé), DOCX, DOC • Taille max: 10 Mo • Nommage: [Type]_[Affaire]_[Date]
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filtres */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="shadow-elegant">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un document..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedDossier} onValueChange={setSelectedDossier}>
                  <SelectTrigger className="w-full md:w-56">
                    <FolderOpen className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Tous les dossiers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les dossiers</SelectItem>
                    {mesDossiers.map(dossier => (
                      <SelectItem key={dossier.id} value={dossier.id}>
                        {dossier.numero}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Type de document" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    {documentTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Liste des documents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Documents ({filteredDocuments.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredDocuments.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Aucun document trouvé</p>
                  <Button variant="outline" className="mt-4" onClick={() => setIsUploadOpen(true)}>
                    <Upload className="w-4 h-4 mr-2" />
                    Téléverser votre premier document
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredDocuments.map((doc, index) => (
                    <motion.div
                      key={doc.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-primary/10">
                          <FileText className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{doc.nom}</p>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <Badge variant="outline">{getTypeLabel(doc.type)}</Badge>
                            <span className="text-sm text-muted-foreground">
                              Dossier: {doc.dossierNumero}
                            </span>
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(doc.dateAjout).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default AvocatDocuments;
