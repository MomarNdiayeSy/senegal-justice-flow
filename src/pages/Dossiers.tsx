import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, FileText, Upload, Download, Eye } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DashboardLayout from "@/components/DashboardLayout";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";

const Dossiers = () => {
  const { dossiers, audiences, addDossier } = useApp();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    numero: "",
    titre: "",
    description: "",
    statut: "ouvert" as "ouvert" | "en_cours" | "clos" | "archive",
    audienceId: "",
    pieces: [] as any[]
  });

  const statutColors = {
    ouvert: "bg-blue-500 hover:bg-blue-600",
    en_cours: "bg-amber-500 hover:bg-amber-600",
    clos: "bg-green-500 hover:bg-green-600",
    archive: "bg-gray-500 hover:bg-gray-600"
  };

  const statutLabels = {
    ouvert: "Ouvert",
    en_cours: "En cours",
    clos: "Clos",
    archive: "Archivé"
  };

  const filteredDossiers = dossiers.filter(dossier =>
    dossier.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dossier.titre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addDossier(formData);
    toast({
      title: "Dossier créé",
      description: `Le dossier ${formData.numero} a été créé.`
    });
    setDialogOpen(false);
    setFormData({
      numero: "",
      titre: "",
      description: "",
      statut: "ouvert",
      audienceId: "",
      pieces: []
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newPieces = Array.from(files).map(file => ({
        id: Date.now().toString() + Math.random(),
        nom: file.name,
        type: file.type,
        taille: (file.size / 1024 / 1024).toFixed(2) + " MB",
        dateAjout: new Date().toISOString(),
        ajoutePar: "current-user"
      }));
      setFormData({ ...formData, pieces: [...formData.pieces, ...newPieces] });
      toast({
        title: "Fichier(s) ajouté(s)",
        description: `${newPieces.length} fichier(s) ajouté(s) au dossier.`
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Card className="shadow-md border-0">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle className="text-2xl">Gestion des dossiers</CardTitle>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="shadow-gold hover:shadow-gold">
                    <Plus className="w-5 h-5 mr-2" />
                    Nouveau dossier
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Créer un nouveau dossier</DialogTitle>
                    <DialogDescription>
                      Enregistrez un nouveau dossier judiciaire
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
                      <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-accent transition-smooth cursor-pointer">
                        <Input
                          type="file"
                          multiple
                          onChange={handleFileUpload}
                          className="hidden"
                          id="file-upload"
                        />
                        <label htmlFor="file-upload" className="cursor-pointer">
                          <Upload className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            Cliquez pour ajouter des fichiers
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            PDF, DOCX, images acceptés
                          </p>
                        </label>
                      </div>
                      {formData.pieces.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {formData.pieces.map((piece) => (
                            <div key={piece.id} className="flex items-center gap-2 text-sm p-2 bg-secondary rounded">
                              <FileText className="w-4 h-4" />
                              <span className="flex-1">{piece.nom}</span>
                              <span className="text-muted-foreground">{piece.taille}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <Button type="submit" className="w-full">
                      Créer le dossier
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Rechercher par numéro ou titre..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredDossiers.map((dossier, index) => (
                <motion.div
                  key={dossier.id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-md transition-smooth h-full">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-bold text-lg mb-1">{dossier.numero}</h3>
                            <p className="text-muted-foreground">{dossier.titre}</p>
                          </div>
                          <Badge className={`${statutColors[dossier.statut]} text-white`}>
                            {statutLabels[dossier.statut]}
                          </Badge>
                        </div>

                        <p className="text-sm line-clamp-2">{dossier.description}</p>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <FileText className="w-4 h-4" />
                          <span>{dossier.pieces.length} pièce(s) jointe(s)</span>
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Eye className="w-4 h-4 mr-2" />
                            Consulter
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            <Download className="w-4 h-4 mr-2" />
                            Télécharger
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dossiers;
