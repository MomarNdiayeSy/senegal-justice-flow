import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  ArrowLeft,
  MapPin,
  Search,
  Phone,
  Clock,
  Building2,
  Scale,
  Shield,
  Users,
  ExternalLink,
  Navigation
} from "lucide-react";

interface Location {
  id: string;
  name: string;
  type: "tribunal" | "commissariat" | "gendarmerie" | "maison_justice" | "barreau";
  address: string;
  city: string;
  phone: string;
  hours: string;
  services: string[];
}

const Localisation = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");

  const locations: Location[] = [
    {
      id: "1",
      name: "Tribunal de Grande Instance de Dakar",
      type: "tribunal",
      address: "Avenue Léopold Sédar Senghor, Plateau",
      city: "Dakar",
      phone: "+221 33 889 20 00",
      hours: "8h00 - 16h00 (Lun-Ven)",
      services: ["Affaires civiles", "Affaires pénales", "Affaires commerciales"]
    },
    {
      id: "2",
      name: "Commissariat Central de Dakar",
      type: "commissariat",
      address: "Rue Félix Éboué, Plateau",
      city: "Dakar",
      phone: "+221 33 823 25 20",
      hours: "24h/24 - 7j/7",
      services: ["Dépôt de plaintes", "Main courante", "Déclarations de perte"]
    },
    {
      id: "3",
      name: "Gendarmerie Nationale - Brigade de Dakar",
      type: "gendarmerie",
      address: "Avenue Lamine Guèye, Médina",
      city: "Dakar",
      phone: "+221 33 821 24 24",
      hours: "24h/24 - 7j/7",
      services: ["Dépôt de plaintes", "Enquêtes", "Convocations"]
    },
    {
      id: "4",
      name: "Maison de Justice de Pikine",
      type: "maison_justice",
      address: "Quartier Icotaf, Pikine",
      city: "Pikine",
      phone: "+221 33 834 15 00",
      hours: "8h30 - 17h00 (Lun-Ven)",
      services: ["Médiation", "Information juridique", "Aide aux victimes"]
    },
    {
      id: "5",
      name: "Barreau de Dakar",
      type: "barreau",
      address: "Immeuble Kébé, Avenue Albert Sarraut",
      city: "Dakar",
      phone: "+221 33 822 10 10",
      hours: "9h00 - 17h00 (Lun-Ven)",
      services: ["Consultations juridiques", "Permanence avocats", "Aide juridictionnelle"]
    },
    {
      id: "6",
      name: "Tribunal d'Instance de Thiès",
      type: "tribunal",
      address: "Avenue Casamance, Centre-ville",
      city: "Thiès",
      phone: "+221 33 951 10 00",
      hours: "8h00 - 16h00 (Lun-Ven)",
      services: ["Affaires civiles", "Petits litiges", "Contentieux locatif"]
    },
    {
      id: "7",
      name: "Commissariat de Police de Parcelles Assainies",
      type: "commissariat",
      address: "Unité 16, Parcelles Assainies",
      city: "Dakar",
      phone: "+221 33 835 45 00",
      hours: "24h/24 - 7j/7",
      services: ["Dépôt de plaintes", "Interventions d'urgence"]
    },
    {
      id: "8",
      name: "Maison de Justice de Guédiawaye",
      type: "maison_justice",
      address: "Sam Notaire, Guédiawaye",
      city: "Guédiawaye",
      phone: "+221 33 837 20 00",
      hours: "8h30 - 17h00 (Lun-Ven)",
      services: ["Médiation familiale", "Information juridique", "Orientation"]
    },
    {
      id: "9",
      name: "Tribunal de Commerce de Dakar",
      type: "tribunal",
      address: "Boulevard de la République, Plateau",
      city: "Dakar",
      phone: "+221 33 889 30 00",
      hours: "8h00 - 16h00 (Lun-Ven)",
      services: ["Litiges commerciaux", "Procédures collectives", "Registre du commerce"]
    },
    {
      id: "10",
      name: "Gendarmerie de Rufisque",
      type: "gendarmerie",
      address: "Route Nationale 1, Rufisque",
      city: "Rufisque",
      phone: "+221 33 836 10 10",
      hours: "24h/24 - 7j/7",
      services: ["Dépôt de plaintes", "Accidents de la route", "Enquêtes"]
    }
  ];

  const types = [
    { id: "all", label: "Tous", icon: MapPin },
    { id: "tribunal", label: "Tribunaux", icon: Scale },
    { id: "commissariat", label: "Commissariats", icon: Shield },
    { id: "gendarmerie", label: "Gendarmeries", icon: Shield },
    { id: "maison_justice", label: "Maisons de Justice", icon: Building2 },
    { id: "barreau", label: "Barreaux", icon: Users }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "tribunal": return Scale;
      case "commissariat": return Shield;
      case "gendarmerie": return Shield;
      case "maison_justice": return Building2;
      case "barreau": return Users;
      default: return MapPin;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "tribunal": return "from-blue-500 to-indigo-500";
      case "commissariat": return "from-red-500 to-orange-500";
      case "gendarmerie": return "from-green-600 to-emerald-500";
      case "maison_justice": return "from-purple-500 to-pink-500";
      case "barreau": return "from-amber-500 to-yellow-500";
      default: return "from-gray-500 to-gray-600";
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "tribunal": return "Tribunal";
      case "commissariat": return "Commissariat";
      case "gendarmerie": return "Gendarmerie";
      case "maison_justice": return "Maison de Justice";
      case "barreau": return "Barreau";
      default: return type;
    }
  };

  const filteredLocations = locations.filter(loc => {
    const matchesSearch = loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         loc.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         loc.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "all" || loc.type === selectedType;
    return matchesSearch && matchesType;
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
          <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-500">
            <MapPin className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold">
              Où aller ?
            </h1>
            <p className="text-muted-foreground">
              Localisez les services judiciaires près de chez vous
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
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom, ville ou adresse..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Type Filters */}
        <div className="flex flex-wrap gap-2">
          {types.map((type) => (
            <Button
              key={type.id}
              variant={selectedType === type.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedType(type.id)}
              className="transition-all"
            >
              <type.icon className="w-4 h-4 mr-1" />
              {type.label}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Map Placeholder */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-6"
      >
        <Card className="p-8 bg-gradient-to-br from-orange-500/5 to-red-500/5 border-dashed">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Carte interactive bientôt disponible
            </p>
          </div>
        </Card>
      </motion.div>

      {/* Locations Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {filteredLocations.map((location) => {
          const TypeIcon = getTypeIcon(location.type);
          return (
            <motion.div key={location.id} variants={itemVariants}>
              <Card className="p-4 h-full hover:shadow-md transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${getTypeColor(location.type)} flex-shrink-0`}>
                    <TypeIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold">{location.name}</h3>
                      <Badge variant="outline" className="flex-shrink-0">
                        {getTypeBadge(location.type)}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{location.address}, {location.city}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <a href={`tel:${location.phone}`} className="text-accent hover:underline">
                          {location.phone}
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{location.hours}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-3">
                      {location.services.map((service, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {service}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Navigation className="w-3 h-3 mr-1" />
                        Itinéraire
                      </Button>
                      <Button size="sm" asChild className="flex-1">
                        <a href={`tel:${location.phone}`}>
                          <Phone className="w-3 h-3 mr-1" />
                          Appeler
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {filteredLocations.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Aucun service trouvé</p>
        </div>
      )}

      {/* Stats */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4"
      >
        {types.slice(1).map((type) => (
          <Card key={type.id} className="p-4 text-center">
            <type.icon className="w-8 h-8 mx-auto mb-2 text-accent" />
            <div className="text-2xl font-bold">
              {locations.filter(l => l.type === type.id).length}
            </div>
            <div className="text-xs text-muted-foreground">{type.label}</div>
          </Card>
        ))}
      </motion.div>
    </div>
  );
};

export default Localisation;
