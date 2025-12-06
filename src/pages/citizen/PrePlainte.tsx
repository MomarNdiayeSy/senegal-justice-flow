import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ArrowLeft, 
  ArrowRight, 
  FileText, 
  User, 
  Calendar, 
  MapPin, 
  Upload, 
  CheckCircle2,
  AlertCircle,
  Download
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface FormData {
  // Étape 1: Identité
  nom: string;
  prenom: string;
  dateNaissance: string;
  lieuNaissance: string;
  nationalite: string;
  profession: string;
  adresse: string;
  telephone: string;
  email: string;
  // Étape 2: Faits
  typePlainte: string;
  dateFaits: string;
  heureFaits: string;
  lieuFaits: string;
  descriptionFaits: string;
  // Étape 3: Témoins et preuves
  temoins: string;
  documents: string[];
  // Étape 4: Récapitulatif
}

const PrePlainte = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    nom: "",
    prenom: "",
    dateNaissance: "",
    lieuNaissance: "",
    nationalite: "Sénégalaise",
    profession: "",
    adresse: "",
    telephone: "",
    email: "",
    typePlainte: "",
    dateFaits: "",
    heureFaits: "",
    lieuFaits: "",
    descriptionFaits: "",
    temoins: "",
    documents: []
  });

  const totalSteps = 4;

  const steps = [
    { number: 1, title: "Identité", icon: User },
    { number: 2, title: "Les Faits", icon: Calendar },
    { number: 3, title: "Preuves", icon: Upload },
    { number: 4, title: "Récapitulatif", icon: CheckCircle2 }
  ];

  const typesPlainte = [
    "Vol",
    "Agression",
    "Escroquerie",
    "Abus de confiance",
    "Harcèlement",
    "Dégradation de biens",
    "Diffamation",
    "Menaces",
    "Autre"
  ];

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleFileUpload = () => {
    // Simulation d'upload
    toast.success("Document ajouté avec succès");
    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, `document_${prev.documents.length + 1}.pdf`]
    }));
  };

  const handleSubmit = () => {
    toast.success("Pré-plainte générée avec succès ! Vous pouvez la télécharger.");
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nom">Nom *</Label>
                <Input
                  id="nom"
                  value={formData.nom}
                  onChange={(e) => handleInputChange("nom", e.target.value)}
                  placeholder="Votre nom de famille"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prenom">Prénom *</Label>
                <Input
                  id="prenom"
                  value={formData.prenom}
                  onChange={(e) => handleInputChange("prenom", e.target.value)}
                  placeholder="Votre prénom"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateNaissance">Date de naissance *</Label>
                <Input
                  id="dateNaissance"
                  type="date"
                  value={formData.dateNaissance}
                  onChange={(e) => handleInputChange("dateNaissance", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lieuNaissance">Lieu de naissance *</Label>
                <Input
                  id="lieuNaissance"
                  value={formData.lieuNaissance}
                  onChange={(e) => handleInputChange("lieuNaissance", e.target.value)}
                  placeholder="Ville de naissance"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nationalite">Nationalité</Label>
                <Input
                  id="nationalite"
                  value={formData.nationalite}
                  onChange={(e) => handleInputChange("nationalite", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profession">Profession</Label>
                <Input
                  id="profession"
                  value={formData.profession}
                  onChange={(e) => handleInputChange("profession", e.target.value)}
                  placeholder="Votre profession"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="adresse">Adresse complète *</Label>
              <Input
                id="adresse"
                value={formData.adresse}
                onChange={(e) => handleInputChange("adresse", e.target.value)}
                placeholder="Numéro, rue, quartier, ville"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telephone">Téléphone *</Label>
                <Input
                  id="telephone"
                  value={formData.telephone}
                  onChange={(e) => handleInputChange("telephone", e.target.value)}
                  placeholder="+221 XX XXX XX XX"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="votre@email.com"
                />
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <Label htmlFor="typePlainte">Type de plainte *</Label>
              <Select
                value={formData.typePlainte}
                onValueChange={(value) => handleInputChange("typePlainte", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez le type de plainte" />
                </SelectTrigger>
                <SelectContent>
                  {typesPlainte.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateFaits">Date des faits *</Label>
                <Input
                  id="dateFaits"
                  type="date"
                  value={formData.dateFaits}
                  onChange={(e) => handleInputChange("dateFaits", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="heureFaits">Heure approximative</Label>
                <Input
                  id="heureFaits"
                  type="time"
                  value={formData.heureFaits}
                  onChange={(e) => handleInputChange("heureFaits", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lieuFaits">Lieu des faits *</Label>
              <Input
                id="lieuFaits"
                value={formData.lieuFaits}
                onChange={(e) => handleInputChange("lieuFaits", e.target.value)}
                placeholder="Adresse précise où les faits se sont produits"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descriptionFaits">Description détaillée des faits *</Label>
              <Textarea
                id="descriptionFaits"
                value={formData.descriptionFaits}
                onChange={(e) => handleInputChange("descriptionFaits", e.target.value)}
                placeholder="Décrivez les faits de manière chronologique et détaillée..."
                className="min-h-[200px]"
              />
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <Label htmlFor="temoins">Témoins (optionnel)</Label>
              <Textarea
                id="temoins"
                value={formData.temoins}
                onChange={(e) => handleInputChange("temoins", e.target.value)}
                placeholder="Nom, prénom et coordonnées des témoins éventuels..."
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-4">
              <Label>Documents justificatifs (optionnel)</Label>
              <Card className="p-6 border-dashed border-2 bg-secondary/20">
                <div className="text-center">
                  <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Glissez-déposez vos fichiers ici ou cliquez pour sélectionner
                  </p>
                  <Button variant="outline" onClick={handleFileUpload}>
                    <Upload className="w-4 h-4 mr-2" />
                    Ajouter un document
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Formats acceptés: PDF, JPG, PNG (max 10 Mo)
                  </p>
                </div>
              </Card>

              {formData.documents.length > 0 && (
                <div className="space-y-2">
                  <Label>Documents ajoutés:</Label>
                  {formData.documents.map((doc, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-secondary/30 rounded-lg">
                      <FileText className="w-4 h-4 text-accent" />
                      <span className="text-sm">{doc}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Card className="p-4 bg-amber-500/10 border-amber-500/30">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <div>
                  <p className="font-medium text-amber-700 dark:text-amber-400">Information importante</p>
                  <p className="text-sm text-muted-foreground">
                    Les documents originaux devront être présentés lors de votre déplacement au commissariat.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <Card className="p-6 bg-success/10 border-success/30">
              <div className="flex gap-3">
                <CheckCircle2 className="w-6 h-6 text-success flex-shrink-0" />
                <div>
                  <p className="font-semibold text-success">Pré-plainte prête !</p>
                  <p className="text-sm text-muted-foreground">
                    Vérifiez les informations ci-dessous avant de générer votre document.
                  </p>
                </div>
              </div>
            </Card>

            <div className="grid gap-6">
              <Card className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <User className="w-5 h-5 text-accent" />
                  Informations personnelles
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-muted-foreground">Nom:</span> {formData.nom}</div>
                  <div><span className="text-muted-foreground">Prénom:</span> {formData.prenom}</div>
                  <div><span className="text-muted-foreground">Né(e) le:</span> {formData.dateNaissance}</div>
                  <div><span className="text-muted-foreground">À:</span> {formData.lieuNaissance}</div>
                  <div><span className="text-muted-foreground">Téléphone:</span> {formData.telephone}</div>
                  <div><span className="text-muted-foreground">Email:</span> {formData.email}</div>
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-accent" />
                  Les faits
                </h3>
                <div className="space-y-2 text-sm">
                  <div><span className="text-muted-foreground">Type:</span> {formData.typePlainte}</div>
                  <div><span className="text-muted-foreground">Date:</span> {formData.dateFaits} à {formData.heureFaits}</div>
                  <div><span className="text-muted-foreground">Lieu:</span> {formData.lieuFaits}</div>
                  <div className="mt-2">
                    <span className="text-muted-foreground">Description:</span>
                    <p className="mt-1">{formData.descriptionFaits}</p>
                  </div>
                </div>
              </Card>

              {(formData.temoins || formData.documents.length > 0) && (
                <Card className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Upload className="w-5 h-5 text-accent" />
                    Témoins et preuves
                  </h3>
                  {formData.temoins && (
                    <div className="text-sm mb-2">
                      <span className="text-muted-foreground">Témoins:</span> {formData.temoins}
                    </div>
                  )}
                  {formData.documents.length > 0 && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Documents:</span> {formData.documents.join(", ")}
                    </div>
                  )}
                </Card>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={handleSubmit} className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Télécharger la pré-plainte
              </Button>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-8"
      >
        <Button 
          variant="ghost" 
          onClick={() => navigate("/citizen/dashboard")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour au tableau de bord
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold">
              Assistant Pré-Plainte
            </h1>
            <p className="text-muted-foreground">
              Préparez votre plainte en ligne étape par étape
            </p>
          </div>
        </div>
      </motion.div>

      {/* Progress Steps */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-8"
      >
        <div className="flex justify-between items-center">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className={`flex flex-col items-center ${index < steps.length - 1 ? "flex-1" : ""}`}>
                <div
                  className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all ${
                    currentStep >= step.number
                      ? "bg-accent text-accent-foreground"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  <step.icon className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <span className={`text-xs md:text-sm mt-2 hidden sm:block ${
                  currentStep >= step.number ? "text-accent font-medium" : "text-muted-foreground"
                }`}>
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`h-1 w-8 md:w-16 lg:w-24 mx-2 rounded-full ${
                  currentStep > step.number ? "bg-accent" : "bg-secondary"
                }`} />
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Form Content */}
      <Card className="p-6 md:p-8">
        <AnimatePresence mode="wait">
          {renderStepContent()}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Précédent
          </Button>
          {currentStep < totalSteps ? (
            <Button onClick={nextStep}>
              Suivant
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : null}
        </div>
      </Card>
    </div>
  );
};

export default PrePlainte;
