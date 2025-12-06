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
      description: "Préparez votre plainte en ligne avec notre assistant guidé.",
      path: "/citizen/pre-plainte",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500/10"
    },
    {
      icon: Compass,
      title: "Guide des Démarches",
      description: "Découvrez les étapes à suivre pour vos procédures.",
      path: "/citizen/demarches",
      color: "from-emerald-500 to-teal-500",
      bgColor: "bg-emerald-500/10"
    },
    {
      icon: FileDown,
      title: "Modèles de Documents",
      description: "Téléchargez des modèles juridiques gratuits.",
      path: "/citizen/modeles",
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-500/10"
    },
    {
      icon: MapPin,
      title: "Où aller ?",
      description: "Localisez les services juridiques près de chez vous.",
      path: "/citizen/localisation",
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-500/10"
    },
    {
      icon: BookOpen,
      title: "Sama Yoon",
      description: "Mini-encyclopédie de vos droits en wolof.",
      path: "/citizen/sama-yoon",
      color: "from-amber-500 to-yellow-500",
      bgColor: "bg-amber-500/10"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <Card className="p-6 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-0">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="flex items-center gap-3">
            <Heart className="w-10 h-10 text-accent" />
            <Shield className="w-10 h-10 text-primary" />
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-xl font-semibold mb-1">Bienvenue dans Sama Justice</h2>
            <p className="text-muted-foreground">
              Votre espace citoyen pour accéder facilement à la justice
            </p>
          </div>
        </div>
      </Card>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card 
              className="h-full p-5 hover:shadow-md transition-all duration-300 cursor-pointer group"
              onClick={() => navigate(tool.path)}
            >
              <div className={`${tool.bgColor} p-3 rounded-xl w-fit mb-3 group-hover:scale-110 transition-transform`}>
                <tool.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-1 group-hover:text-accent transition-colors">
                {tool.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                {tool.description}
              </p>
              <div className="flex items-center text-accent text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                Accéder
                <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Documents", value: "25+" },
          { label: "Guides", value: "12" },
          { label: "Services", value: "150+" },
          { label: "Articles", value: "50+" }
        ].map((stat, index) => (
          <Card key={index} className="p-4 text-center border-0 bg-secondary/30">
            <div className="text-2xl font-bold text-accent">{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CitizenDashboard;
