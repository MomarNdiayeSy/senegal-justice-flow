import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  ArrowLeft,
  FileDown,
  Search,
  FileText,
  Download,
  Eye,
  Star,
  Filter
} from "lucide-react";
import { toast } from "sonner";

interface Document {
  id: string;
  title: string;
  description: string;
  category: string;
  format: string;
  size: string;
  downloads: number;
  popular: boolean;
}

const Modeles = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const documents: Document[] = [
    {
      id: "1",
      title: "Lettre de plainte simple",
      description: "Modèle de lettre pour déposer une plainte auprès du procureur de la République.",
      category: "Plaintes",
      format: "DOCX",
      size: "45 Ko",
      downloads: 1250,
      popular: true
    },
    {
      id: "2",
      title: "Constitution de partie civile",
      description: "Formulaire pour se constituer partie civile dans une procédure pénale.",
      category: "Procédures",
      format: "PDF",
      size: "120 Ko",
      downloads: 890,
      popular: true
    },
    {
      id: "3",
      title: "Demande d'aide juridictionnelle",
      description: "Formulaire officiel pour demander l'aide juridictionnelle.",
      category: "Aides",
      format: "PDF",
      size: "85 Ko",
      downloads: 2100,
      popular: true
    },
    {
      id: "4",
      title: "Lettre de mise en demeure",
      description: "Modèle de mise en demeure avant action en justice.",
      category: "Courriers",
      format: "DOCX",
      size: "38 Ko",
      downloads: 1567,
      popular: true
    },
    {
      id: "5",
      title: "Déclaration d'appel",
      description: "Modèle de déclaration pour faire appel d'un jugement.",
      category: "Procédures",
      format: "DOCX",
      size: "52 Ko",
      downloads: 456,
      popular: false
    },
    {
      id: "6",
      title: "Demande de casier judiciaire",
      description: "Formulaire pour demander un extrait de casier judiciaire.",
      category: "Administratif",
      format: "PDF",
      size: "65 Ko",
      downloads: 3200,
      popular: true
    },
    {
      id: "7",
      title: "Attestation de témoin",
      description: "Modèle d'attestation à faire remplir par les témoins.",
      category: "Témoignages",
      format: "PDF",
      size: "42 Ko",
      downloads: 780,
      popular: false
    },
    {
      id: "8",
      title: "Requête au juge aux affaires familiales",
      description: "Modèle de requête pour saisir le JAF.",
      category: "Famille",
      format: "DOCX",
      size: "58 Ko",
      downloads: 920,
      popular: false
    },
    {
      id: "9",
      title: "Lettre de désistement",
      description: "Modèle pour se désister d'une procédure en cours.",
      category: "Procédures",
      format: "DOCX",
      size: "35 Ko",
      downloads: 234,
      popular: false
    },
    {
      id: "10",
      title: "Demande de médiation",
      description: "Formulaire de demande de médiation pour résoudre un litige à l'amiable.",
      category: "Médiation",
      format: "PDF",
      size: "48 Ko",
      downloads: 567,
      popular: false
    },
    {
      id: "11",
      title: "Procuration générale",
      description: "Modèle de procuration pour représentation en justice.",
      category: "Administratif",
      format: "DOCX",
      size: "40 Ko",
      downloads: 1890,
      popular: true
    },
    {
      id: "12",
      title: "Demande d'ordonnance de protection",
      description: "Formulaire pour demander une protection en cas de violences.",
      category: "Protection",
      format: "PDF",
      size: "72 Ko",
      downloads: 445,
      popular: false
    }
  ];

  const categories = [
    { id: "all", label: "Tous", count: documents.length },
    { id: "Plaintes", label: "Plaintes", count: documents.filter(d => d.category === "Plaintes").length },
    { id: "Procédures", label: "Procédures", count: documents.filter(d => d.category === "Procédures").length },
    { id: "Administratif", label: "Administratif", count: documents.filter(d => d.category === "Administratif").length },
    { id: "Courriers", label: "Courriers", count: documents.filter(d => d.category === "Courriers").length },
    { id: "Famille", label: "Famille", count: documents.filter(d => d.category === "Famille").length },
    { id: "Aides", label: "Aides", count: documents.filter(d => d.category === "Aides").length }
  ];

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDownload = (doc: Document) => {
    toast.success(`Téléchargement de "${doc.title}" en cours...`);
  };

  const handlePreview = (doc: Document) => {
    toast.info(`Aperçu de "${doc.title}"`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
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
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
            <FileDown className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold">
              Modèles de Documents
            </h1>
            <p className="text-muted-foreground">
              Téléchargez des modèles gratuits pour vos démarches
            </p>
          </div>
        </div>
      </motion.div>

      {/* Search and Filter */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-6"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un document..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mt-4">
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat.id)}
              className="transition-all"
            >
              {cat.label}
              <Badge variant="secondary" className="ml-2">
                {cat.count}
              </Badge>
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Popular Documents */}
      {selectedCategory === "all" && !searchQuery && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500" />
            Documents populaires
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.filter(d => d.popular).slice(0, 3).map((doc) => (
              <Card key={doc.id} className="p-4 border-amber-500/20 bg-amber-500/5">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <FileText className="w-6 h-6 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{doc.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{doc.downloads} téléchargements</p>
                    <Button size="sm" onClick={() => handleDownload(doc)}>
                      <Download className="w-3 h-3 mr-1" />
                      Télécharger
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {/* Documents Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {filteredDocuments.map((doc) => (
          <motion.div key={doc.id} variants={itemVariants}>
            <Card className="p-4 h-full hover:shadow-md transition-all duration-300 flex flex-col">
              <div className="flex items-start gap-3 mb-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold">{doc.title}</h3>
                    {doc.popular && (
                      <Star className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    )}
                  </div>
                  <Badge variant="outline" className="mt-1">
                    {doc.category}
                  </Badge>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-4 flex-1">
                {doc.description}
              </p>

              <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                <span>{doc.format} • {doc.size}</span>
                <span>{doc.downloads} téléchargements</span>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handlePreview(doc)}
                >
                  <Eye className="w-3 h-3 mr-1" />
                  Aperçu
                </Button>
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleDownload(doc)}
                >
                  <Download className="w-3 h-3 mr-1" />
                  Télécharger
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {filteredDocuments.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Aucun document trouvé</p>
        </div>
      )}
    </div>
  );
};

export default Modeles;
