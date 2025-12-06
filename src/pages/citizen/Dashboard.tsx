import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  FileText, 
  Compass, 
  FileDown, 
  MapPin, 
  BookOpen, 
  ArrowRight,
  Scale,
  Heart,
  Shield
} from "lucide-react";

const CitizenDashboard = () => {
  const navigate = useNavigate();

  const tools = [
    {
      icon: FileText,
      title: "Assistant Pré-Plainte",
      description: "Préparez votre plainte en ligne avec notre assistant guidé étape par étape.",
      path: "/citizen/pre-plainte",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500/10"
    },
    {
      icon: Compass,
      title: "Guide des Démarches",
      description: "Découvrez les étapes à suivre pour vos procédures judiciaires.",
      path: "/citizen/demarches",
      color: "from-emerald-500 to-teal-500",
      bgColor: "bg-emerald-500/10"
    },
    {
      icon: FileDown,
      title: "Modèles de Documents",
      description: "Téléchargez des modèles de documents juridiques gratuits.",
      path: "/citizen/modeles",
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-500/10"
    },
    {
      icon: MapPin,
      title: "Où aller ?",
      description: "Localisez les commissariats, tribunaux et services juridiques près de chez vous.",
      path: "/citizen/localisation",
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-500/10"
    },
    {
      icon: BookOpen,
      title: "Sama Yoon – Mes droits",
      description: "Mini-encyclopédie de vos droits en tant que citoyen sénégalais.",
      path: "/citizen/sama-yoon",
      color: "from-amber-500 to-yellow-500",
      bgColor: "bg-amber-500/10"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
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
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-accent to-accent/80">
            <Scale className="w-8 h-8 text-accent-foreground" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold">
              Espace Citoyen – <span className="text-accent">Sama Justice</span>
            </h1>
            <p className="text-muted-foreground">
              Faciliter l'accès à la justice pour tous les citoyens
            </p>
          </div>
        </div>

        {/* Welcome Banner */}
        <Card className="p-6 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-0">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex items-center gap-3">
              <Heart className="w-10 h-10 text-accent" />
              <Shield className="w-10 h-10 text-primary" />
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-xl font-semibold mb-1">Bienvenue dans votre espace citoyen</h2>
              <p className="text-muted-foreground">
                Accédez à tous les outils pour vous accompagner dans vos démarches judiciaires.
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Tools Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {tools.map((tool, index) => (
          <motion.div key={index} variants={itemVariants}>
            <Card 
              className="h-full p-6 hover:shadow-elegant transition-all duration-300 cursor-pointer group border-0 relative overflow-hidden"
              onClick={() => navigate(tool.path)}
            >
              {/* Background gradient on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              
              {/* Icon */}
              <div className={`${tool.bgColor} p-4 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <tool.icon className={`w-8 h-8 bg-gradient-to-br ${tool.color} bg-clip-text`} style={{ color: 'transparent', backgroundClip: 'text', WebkitBackgroundClip: 'text' }} />
                <tool.icon className={`w-8 h-8 text-primary`} />
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold mb-2 group-hover:text-accent transition-colors">
                {tool.title}
              </h3>
              <p className="text-muted-foreground mb-4">
                {tool.description}
              </p>

              {/* Action */}
              <div className="flex items-center text-accent font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Accéder
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { label: "Documents disponibles", value: "25+" },
          { label: "Guides pratiques", value: "12" },
          { label: "Services localisés", value: "150+" },
          { label: "Articles juridiques", value: "50+" }
        ].map((stat, index) => (
          <Card key={index} className="p-4 text-center border-0 bg-secondary/30">
            <div className="text-2xl md:text-3xl font-bold text-accent">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </Card>
        ))}
      </motion.div>
    </div>
  );
};

export default CitizenDashboard;
