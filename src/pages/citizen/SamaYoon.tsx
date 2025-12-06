import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Search,
  ChevronRight,
  Shield,
  Users,
  Home,
  Briefcase,
  Heart,
  Baby,
  Scale,
  Car,
  Building2,
  AlertCircle
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface RightCategory {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  rights: {
    title: string;
    content: string;
  }[];
}

const SamaYoon = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories: RightCategory[] = [
    {
      id: "citoyennete",
      title: "Droits du citoyen",
      icon: Shield,
      color: "from-blue-500 to-indigo-500",
      rights: [
        {
          title: "Droit à l'égalité",
          content: "Tous les citoyens sont égaux devant la loi. Nul ne peut être traité différemment en raison de son origine, race, sexe, religion ou opinion politique."
        },
        {
          title: "Droit à la liberté d'expression",
          content: "Chacun a le droit d'exprimer librement ses opinions par la parole, l'écrit ou l'image, dans le respect des lois."
        },
        {
          title: "Droit de vote",
          content: "Tout citoyen majeur a le droit de participer aux élections. Le vote est personnel et secret."
        },
        {
          title: "Droit à la nationalité",
          content: "Tout enfant né au Sénégal de parents sénégalais est sénégalais. La nationalité peut aussi s'acquérir par naturalisation."
        }
      ]
    },
    {
      id: "famille",
      title: "Droits de la famille",
      icon: Heart,
      color: "from-pink-500 to-rose-500",
      rights: [
        {
          title: "Droit au mariage",
          content: "L'homme et la femme ont le droit de se marier et de fonder une famille à partir de l'âge légal (18 ans pour les femmes, 20 ans pour les hommes)."
        },
        {
          title: "Droits des époux",
          content: "Les époux ont des droits et devoirs réciproques : fidélité, secours, assistance. La contribution aux charges du ménage est proportionnelle aux facultés respectives."
        },
        {
          title: "Autorité parentale",
          content: "Les parents exercent conjointement l'autorité parentale. En cas de séparation, le juge statue dans l'intérêt de l'enfant."
        },
        {
          title: "Droit à la pension alimentaire",
          content: "Les parents sont tenus de nourrir, entretenir et élever leurs enfants. En cas de séparation, une pension alimentaire peut être fixée."
        }
      ]
    },
    {
      id: "enfants",
      title: "Droits de l'enfant",
      icon: Baby,
      color: "from-green-500 to-emerald-500",
      rights: [
        {
          title: "Droit à l'éducation",
          content: "Tout enfant a droit à l'éducation. L'école est obligatoire de 6 à 16 ans. L'État garantit l'accès à l'enseignement public gratuit."
        },
        {
          title: "Protection contre le travail",
          content: "Le travail des enfants de moins de 15 ans est interdit. Des conditions spéciales protègent les mineurs de 15 à 18 ans."
        },
        {
          title: "Droit à l'identité",
          content: "Tout enfant doit être déclaré à l'état civil dans les 2 mois suivant sa naissance et a droit à un nom et une nationalité."
        },
        {
          title: "Protection contre les violences",
          content: "L'enfant est protégé contre toute forme de violence, d'abus, de négligence ou d'exploitation."
        }
      ]
    },
    {
      id: "travail",
      title: "Droits du travail",
      icon: Briefcase,
      color: "from-amber-500 to-orange-500",
      rights: [
        {
          title: "Droit au contrat de travail",
          content: "Tout travailleur a droit à un contrat écrit précisant la nature du travail, la rémunération et les conditions d'emploi."
        },
        {
          title: "Droit au salaire minimum",
          content: "Le SMIG (Salaire Minimum Interprofessionnel Garanti) est fixé par décret. Nul ne peut être payé en dessous de ce seuil."
        },
        {
          title: "Droit aux congés",
          content: "Tout travailleur a droit à 24 jours de congés payés par an minimum, plus les jours fériés légaux."
        },
        {
          title: "Protection contre le licenciement abusif",
          content: "Tout licenciement doit être motivé. En cas de licenciement abusif, le travailleur peut saisir l'inspection du travail ou le tribunal."
        }
      ]
    },
    {
      id: "logement",
      title: "Droits au logement",
      icon: Home,
      color: "from-teal-500 to-cyan-500",
      rights: [
        {
          title: "Droit au bail",
          content: "Le locataire a droit à un contrat de bail écrit. La durée minimale est de 3 ans pour un bail d'habitation."
        },
        {
          title: "Protection contre l'expulsion",
          content: "L'expulsion d'un locataire ne peut se faire que par décision de justice. Elle est interdite pendant l'hivernage."
        },
        {
          title: "Droit au préavis",
          content: "En cas de résiliation, le bailleur doit respecter un préavis de 3 mois. Le locataire peut quitter avec un préavis d'1 mois."
        },
        {
          title: "Droit à un logement décent",
          content: "Le logement loué doit répondre à des normes minimales de sécurité, de salubrité et d'habitabilité."
        }
      ]
    },
    {
      id: "consommateur",
      title: "Droits du consommateur",
      icon: Building2,
      color: "from-purple-500 to-violet-500",
      rights: [
        {
          title: "Droit à l'information",
          content: "Le consommateur a droit à une information claire sur les produits : prix, composition, origine, date de péremption."
        },
        {
          title: "Droit à la garantie",
          content: "Tout produit bénéficie d'une garantie légale. Le vendeur est tenu de réparer ou remplacer un produit défectueux."
        },
        {
          title: "Protection contre les clauses abusives",
          content: "Les clauses qui créent un déséquilibre significatif entre les droits et obligations des parties peuvent être annulées."
        },
        {
          title: "Droit de réclamation",
          content: "En cas de litige, le consommateur peut saisir les associations de consommateurs ou la direction du commerce."
        }
      ]
    },
    {
      id: "justice",
      title: "Droits face à la justice",
      icon: Scale,
      color: "from-red-500 to-pink-500",
      rights: [
        {
          title: "Présomption d'innocence",
          content: "Toute personne accusée d'un crime ou délit est présumée innocente jusqu'à ce que sa culpabilité soit établie par un tribunal."
        },
        {
          title: "Droit à un avocat",
          content: "Toute personne a droit à l'assistance d'un avocat dès le début de la garde à vue et tout au long de la procédure."
        },
        {
          title: "Droit à un procès équitable",
          content: "Chacun a droit à ce que sa cause soit entendue équitablement, publiquement et dans un délai raisonnable."
        },
        {
          title: "Droit de faire appel",
          content: "Toute personne condamnée a le droit de faire appel du jugement devant une juridiction supérieure."
        }
      ]
    },
    {
      id: "route",
      title: "Droits des usagers de la route",
      icon: Car,
      color: "from-gray-500 to-slate-600",
      rights: [
        {
          title: "Droit de circuler",
          content: "Tout citoyen a le droit de circuler librement sur les voies publiques, sous réserve du respect du code de la route."
        },
        {
          title: "Droits en cas d'accident",
          content: "En cas d'accident, vous avez le droit de faire constater les dégâts, d'obtenir un constat amiable et de faire appel à votre assurance."
        },
        {
          title: "Droits lors d'un contrôle",
          content: "Lors d'un contrôle routier, vous devez présenter permis, carte grise et assurance. L'agent doit s'identifier et motiver le contrôle."
        },
        {
          title: "Contestation des amendes",
          content: "Toute amende peut être contestée dans un délai de 45 jours auprès de l'officier du ministère public."
        }
      ]
    }
  ];

  const filteredCategories = categories.filter(cat => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return cat.title.toLowerCase().includes(query) ||
           cat.rights.some(r => 
             r.title.toLowerCase().includes(query) || 
             r.content.toLowerCase().includes(query)
           );
  });

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
          <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold">
              Sama Yoon – <span className="text-accent">Mes Droits</span>
            </h1>
            <p className="text-muted-foreground">
              Connaissez vos droits en tant que citoyen sénégalais
            </p>
          </div>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-6"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un droit ou un sujet..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </motion.div>

      {/* Info Card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-8"
      >
        <Card className="p-4 bg-amber-500/10 border-amber-500/30">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <div>
              <p className="font-medium text-amber-700 dark:text-amber-400">Information</p>
              <p className="text-sm text-muted-foreground">
                "Sama Yoon" signifie "Mes Droits" en wolof. Cette section vous aide à comprendre 
                vos droits de manière simple et accessible.
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Categories Grid */}
      {!selectedCategory && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {filteredCategories.map((category) => (
            <motion.div key={category.id} variants={itemVariants}>
              <Card 
                className="p-4 cursor-pointer hover:shadow-md transition-all duration-300 group"
                onClick={() => setSelectedCategory(category.id)}
              >
                <div className={`p-3 rounded-xl bg-gradient-to-br ${category.color} w-fit mb-3 group-hover:scale-110 transition-transform`}>
                  <category.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold mb-1 group-hover:text-accent transition-colors">
                  {category.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {category.rights.length} articles
                </p>
                <div className="flex items-center text-accent text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  Consulter
                  <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Selected Category Detail */}
      {selectedCategory && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button 
            variant="ghost" 
            onClick={() => setSelectedCategory(null)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux catégories
          </Button>

          {(() => {
            const category = categories.find(c => c.id === selectedCategory);
            if (!category) return null;

            return (
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${category.color}`}>
                    <category.icon className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold">{category.title}</h2>
                </div>

                <Accordion type="single" collapsible className="w-full">
                  {category.rights.map((right, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left hover:text-accent">
                        {right.title}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed">
                        {right.content}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </Card>
            );
          })()}
        </motion.div>
      )}

      {/* No Results */}
      {filteredCategories.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Aucun résultat trouvé</p>
        </div>
      )}
    </div>
  );
};

export default SamaYoon;
