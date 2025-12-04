import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  Building2, Clock, Calendar, CheckCircle2, XCircle, AlertTriangle,
  Plus, Edit, Trash2, Eye, Search, Filter, MapPin, Users, Monitor
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import DashboardLayout from "@/components/DashboardLayout";
import { useApp, Audience } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";
import { format, addDays, startOfWeek, isToday, isSameDay, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

// Types pour les salles
interface Salle {
  id: string;
  nom: string;
  capacite: number;
  etage: string;
  equipements: string[];
  disponible: boolean;
  type: "audience" | "reunion" | "polyvalente";
}

// Créneaux horaires standard du tribunal
const CRENEAUX_HORAIRES = [
  { debut: "08:00", fin: "09:30", label: "08h00 - 09h30" },
  { debut: "09:30", fin: "11:00", label: "09h30 - 11h00" },
  { debut: "11:00", fin: "12:30", label: "11h00 - 12h30" },
  { debut: "14:00", fin: "15:30", label: "14h00 - 15h30" },
  { debut: "15:30", fin: "17:00", label: "15h30 - 17h00" },
  { debut: "17:00", fin: "18:30", label: "17h00 - 18h30" },
];

// Mock data pour les salles
const SALLES_DATA: Salle[] = [
  { id: "s1", nom: "Salle 1", capacite: 50, etage: "RDC", equipements: ["Micro", "Écran", "Climatisation"], disponible: true, type: "audience" },
  { id: "s2", nom: "Salle 2", capacite: 30, etage: "RDC", equipements: ["Micro", "Écran"], disponible: true, type: "audience" },
  { id: "s3", nom: "Salle 3", capacite: 80, etage: "1er", equipements: ["Micro", "Écran", "Climatisation", "Vidéoconférence"], disponible: true, type: "audience" },
  { id: "s4", nom: "Salle 4", capacite: 20, etage: "1er", equipements: ["Écran"], disponible: true, type: "reunion" },
  { id: "s5", nom: "Salle 5", capacite: 40, etage: "2ème", equipements: ["Micro", "Climatisation"], disponible: false, type: "audience" },
  { id: "s6", nom: "Grande Salle", capacite: 150, etage: "RDC", equipements: ["Micro", "Écran", "Climatisation", "Vidéoconférence", "Accessibilité PMR"], disponible: true, type: "polyvalente" },
];

const GestionSalles = () => {
  const { audiences, users } = useApp();
  const { toast } = useToast();
  
  const [salles, setSalles] = useState<Salle[]>(SALLES_DATA);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSalle, setSelectedSalle] = useState<Salle | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grille" | "liste" | "calendrier">("grille");
  
  const [formData, setFormData] = useState({
    nom: "",
    capacite: 30,
    etage: "RDC",
    type: "audience" as Salle["type"],
    equipements: [] as string[],
    disponible: true
  });

  // Équipements disponibles
  const EQUIPEMENTS = ["Micro", "Écran", "Climatisation", "Vidéoconférence", "Accessibilité PMR", "Interprétation"];

  // Calculer les audiences par salle et créneau pour une date donnée
  const getAudiencesForSlot = (salleNom: string, creneau: { debut: string; fin: string }, date: string) => {
    return audiences.filter(a => {
      if (a.salle !== salleNom || a.date !== date) return false;
      const heureAudience = a.heure;
      return heureAudience >= creneau.debut && heureAudience < creneau.fin;
    });
  };

  // Vérifier si un créneau est occupé
  const isSlotOccupied = (salleNom: string, creneau: { debut: string; fin: string }, date: string) => {
    return getAudiencesForSlot(salleNom, creneau, date).length > 0;
  };

  // Calculer les statistiques des salles
  const statsJour = useMemo(() => {
    const total = salles.length * CRENEAUX_HORAIRES.length;
    let occupes = 0;
    let libres = 0;
    let indisponibles = 0;

    salles.forEach(salle => {
      if (!salle.disponible) {
        indisponibles += CRENEAUX_HORAIRES.length;
        return;
      }
      CRENEAUX_HORAIRES.forEach(creneau => {
        if (isSlotOccupied(salle.nom, creneau, selectedDate)) {
          occupes++;
        } else {
          libres++;
        }
      });
    });

    return { total, occupes, libres, indisponibles };
  }, [salles, audiences, selectedDate]);

  // Générer les jours de la semaine
  const weekDays = useMemo(() => {
    const start = startOfWeek(parseISO(selectedDate), { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [selectedDate]);

  // Filtrer les salles
  const filteredSalles = salles.filter(salle => {
    const matchesSearch = salle.nom.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || salle.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nom) {
      toast({
        title: "Erreur",
        description: "Le nom de la salle est obligatoire",
        variant: "destructive"
      });
      return;
    }

    if (selectedSalle) {
      setSalles(salles.map(s => 
        s.id === selectedSalle.id ? { ...s, ...formData } : s
      ));
      toast({
        title: "Salle modifiée",
        description: `La salle ${formData.nom} a été mise à jour`
      });
    } else {
      const newSalle: Salle = {
        ...formData,
        id: `s${Date.now()}`
      };
      setSalles([...salles, newSalle]);
      toast({
        title: "Salle créée",
        description: `La salle ${formData.nom} a été ajoutée`
      });
    }

    setDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      nom: "",
      capacite: 30,
      etage: "RDC",
      type: "audience",
      equipements: [],
      disponible: true
    });
    setSelectedSalle(null);
  };

  const handleEdit = (salle: Salle) => {
    setSelectedSalle(salle);
    setFormData({
      nom: salle.nom,
      capacite: salle.capacite,
      etage: salle.etage,
      type: salle.type,
      equipements: salle.equipements,
      disponible: salle.disponible
    });
    setDialogOpen(true);
  };

  const handleDelete = (salle: Salle) => {
    if (confirm(`Supprimer la salle ${salle.nom} ?`)) {
      setSalles(salles.filter(s => s.id !== salle.id));
      toast({
        title: "Salle supprimée",
        description: `La salle ${salle.nom} a été supprimée`
      });
    }
  };

  const handleEquipementToggle = (equipement: string) => {
    const newEquipements = formData.equipements.includes(equipement)
      ? formData.equipements.filter(e => e !== equipement)
      : [...formData.equipements, equipement];
    setFormData({ ...formData, equipements: newEquipements });
  };

  const getUser = (id: string) => users.find(u => u.id === id);

  const getSlotStatusColor = (salle: Salle, creneau: { debut: string; fin: string }) => {
    if (!salle.disponible) return "bg-muted text-muted-foreground";
    const isOccupied = isSlotOccupied(salle.nom, creneau, selectedDate);
    return isOccupied ? "bg-destructive/20 text-destructive border-destructive/30" : "bg-green-500/20 text-green-700 border-green-500/30";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Building2 className="w-8 h-8 text-primary" />
              Gestion des Salles
            </h1>
            <p className="text-muted-foreground mt-1">
              Gérez les salles d'audience et leurs créneaux de disponibilité
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle salle
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{selectedSalle ? "Modifier la salle" : "Nouvelle salle"}</DialogTitle>
                <DialogDescription>Configurez les détails de la salle d'audience</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nom de la salle *</Label>
                    <Input
                      value={formData.nom}
                      onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                      placeholder="Salle 1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Capacité</Label>
                    <Input
                      type="number"
                      value={formData.capacite}
                      onChange={(e) => setFormData({ ...formData, capacite: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Étage</Label>
                    <Select value={formData.etage} onValueChange={(v) => setFormData({ ...formData, etage: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="RDC">Rez-de-chaussée</SelectItem>
                        <SelectItem value="1er">1er étage</SelectItem>
                        <SelectItem value="2ème">2ème étage</SelectItem>
                        <SelectItem value="3ème">3ème étage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={formData.type} onValueChange={(v: Salle["type"]) => setFormData({ ...formData, type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="audience">Salle d'audience</SelectItem>
                        <SelectItem value="reunion">Salle de réunion</SelectItem>
                        <SelectItem value="polyvalente">Polyvalente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Équipements</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {EQUIPEMENTS.map(equip => (
                      <label key={equip} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.equipements.includes(equip)}
                          onChange={() => handleEquipementToggle(equip)}
                          className="w-4 h-4"
                        />
                        {equip}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Label>Salle disponible</Label>
                  <Switch
                    checked={formData.disponible}
                    onCheckedChange={(v) => setFormData({ ...formData, disponible: v })}
                  />
                </div>
                <DialogFooter>
                  <Button type="submit">{selectedSalle ? "Mettre à jour" : "Créer"}</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total créneaux</p>
                    <p className="text-2xl font-bold">{statsJour.total}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-primary opacity-70" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-green-500/30">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Créneaux libres</p>
                    <p className="text-2xl font-bold text-green-600">{statsJour.libres}</p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border-destructive/30">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Créneaux occupés</p>
                    <p className="text-2xl font-bold text-destructive">{statsJour.occupes}</p>
                  </div>
                  <XCircle className="w-8 h-8 text-destructive" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="border-yellow-500/30">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Indisponibles</p>
                    <p className="text-2xl font-bold text-yellow-600">{statsJour.indisponibles}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Sélection date et filtres */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-auto"
                  />
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher une salle..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-48"
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-40">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    <SelectItem value="audience">Audience</SelectItem>
                    <SelectItem value="reunion">Réunion</SelectItem>
                    <SelectItem value="polyvalente">Polyvalente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as typeof viewMode)}>
                <TabsList>
                  <TabsTrigger value="grille">Grille</TabsTrigger>
                  <TabsTrigger value="liste">Liste</TabsTrigger>
                  <TabsTrigger value="calendrier">Calendrier</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Vue Grille - Planning des créneaux */}
        {viewMode === "grille" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Planning du {format(parseISO(selectedDate), "EEEE d MMMM yyyy", { locale: fr })}
              </CardTitle>
              <CardDescription>
                Cliquez sur un créneau libre pour planifier une audience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="w-full">
                <div className="min-w-[800px]">
                  {/* En-tête des créneaux */}
                  <div className="grid grid-cols-7 gap-2 mb-4">
                    <div className="font-semibold text-muted-foreground">Salle</div>
                    {CRENEAUX_HORAIRES.map(creneau => (
                      <div key={creneau.label} className="text-center text-sm font-medium">
                        {creneau.label}
                      </div>
                    ))}
                  </div>
                  
                  {/* Lignes des salles */}
                  {filteredSalles.map(salle => (
                    <div key={salle.id} className="grid grid-cols-7 gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${salle.disponible ? 'bg-green-500' : 'bg-muted'}`} />
                        <span className="font-medium text-sm truncate">{salle.nom}</span>
                      </div>
                      {CRENEAUX_HORAIRES.map(creneau => {
                        const audiencesSlot = getAudiencesForSlot(salle.nom, creneau, selectedDate);
                        const isOccupied = audiencesSlot.length > 0;
                        
                        return (
                          <motion.div
                            key={`${salle.id}-${creneau.debut}`}
                            className={`p-2 rounded-md border text-xs cursor-pointer transition-all hover:scale-105 ${getSlotStatusColor(salle, creneau)}`}
                            whileHover={{ scale: 1.02 }}
                            onClick={() => {
                              if (isOccupied && audiencesSlot[0]) {
                                toast({
                                  title: `Audience ${audiencesSlot[0].numero}`,
                                  description: `${audiencesSlot[0].parties} - ${audiencesSlot[0].heure}`
                                });
                              } else if (salle.disponible) {
                                toast({
                                  title: "Créneau disponible",
                                  description: `${salle.nom} - ${creneau.label}`
                                });
                              }
                            }}
                          >
                            {!salle.disponible ? (
                              <span className="text-center block">Fermé</span>
                            ) : isOccupied ? (
                              <div className="truncate">
                                <span className="font-medium">{audiencesSlot[0].numero}</span>
                              </div>
                            ) : (
                              <span className="text-center block">Libre</span>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              {/* Légende */}
              <div className="flex items-center gap-6 mt-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-green-500/20 border border-green-500/30" />
                  <span className="text-sm text-muted-foreground">Libre</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-destructive/20 border border-destructive/30" />
                  <span className="text-sm text-muted-foreground">Occupé</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-muted" />
                  <span className="text-sm text-muted-foreground">Indisponible</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Vue Liste - Liste des salles */}
        {viewMode === "liste" && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredSalles.map(salle => {
              const creneauxLibres = CRENEAUX_HORAIRES.filter(c => !isSlotOccupied(salle.nom, c, selectedDate)).length;
              const creneauxOccupes = CRENEAUX_HORAIRES.length - creneauxLibres;
              
              return (
                <motion.div
                  key={salle.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Card className={`relative overflow-hidden ${!salle.disponible ? 'opacity-60' : ''}`}>
                    <div className={`absolute top-0 left-0 w-1 h-full ${salle.disponible ? 'bg-green-500' : 'bg-muted'}`} />
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            {salle.nom}
                          </CardTitle>
                          <CardDescription>{salle.etage}</CardDescription>
                        </div>
                        <Badge variant={salle.type === "audience" ? "default" : salle.type === "reunion" ? "secondary" : "outline"}>
                          {salle.type}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span>{salle.capacite} places</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Monitor className="w-4 h-4 text-muted-foreground" />
                          <span>{salle.equipements.length} équip.</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-wrap">
                        {salle.equipements.slice(0, 3).map(equip => (
                          <Badge key={equip} variant="outline" className="text-xs">{equip}</Badge>
                        ))}
                        {salle.equipements.length > 3 && (
                          <Badge variant="outline" className="text-xs">+{salle.equipements.length - 3}</Badge>
                        )}
                      </div>

                      {salle.disponible && (
                        <div className="pt-2 border-t">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-muted-foreground">Aujourd'hui</span>
                            <span className="font-medium">{creneauxLibres}/{CRENEAUX_HORAIRES.length} libres</span>
                          </div>
                          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-green-500 transition-all"
                              style={{ width: `${(creneauxLibres / CRENEAUX_HORAIRES.length) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => { setSelectedSalle(salle); setDetailsDialogOpen(true); }}>
                          <Eye className="w-3 h-3 mr-1" /> Détails
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEdit(salle)}>
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(salle)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Vue Calendrier - Vue semaine */}
        {viewMode === "calendrier" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Vue Semaine
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="w-full">
                <div className="min-w-[900px]">
                  {/* En-tête jours */}
                  <div className="grid grid-cols-8 gap-2 mb-4">
                    <div />
                    {weekDays.map(day => (
                      <div 
                        key={day.toISOString()} 
                        className={`text-center p-2 rounded-md ${isToday(day) ? 'bg-primary text-primary-foreground' : isSameDay(day, parseISO(selectedDate)) ? 'bg-secondary' : ''}`}
                      >
                        <div className="text-xs text-muted-foreground">{format(day, "EEE", { locale: fr })}</div>
                        <div className="font-semibold">{format(day, "d")}</div>
                      </div>
                    ))}
                  </div>

                  {/* Grille salles x jours */}
                  {filteredSalles.filter(s => s.disponible).map(salle => (
                    <div key={salle.id} className="grid grid-cols-8 gap-2 mb-2">
                      <div className="flex items-center text-sm font-medium">{salle.nom}</div>
                      {weekDays.map(day => {
                        const dateStr = format(day, "yyyy-MM-dd");
                        const audiencesJour = audiences.filter(a => a.salle === salle.nom && a.date === dateStr);
                        const creneauxOccupes = CRENEAUX_HORAIRES.filter(c => isSlotOccupied(salle.nom, c, dateStr)).length;
                        
                        return (
                          <div
                            key={dateStr}
                            className={`p-2 rounded-md text-center text-xs cursor-pointer transition-all ${
                              creneauxOccupes === 0 ? 'bg-green-500/20 text-green-700' :
                              creneauxOccupes === CRENEAUX_HORAIRES.length ? 'bg-destructive/20 text-destructive' :
                              'bg-yellow-500/20 text-yellow-700'
                            }`}
                            onClick={() => setSelectedDate(dateStr)}
                          >
                            <div className="font-medium">{audiencesJour.length}</div>
                            <div className="text-[10px]">audience{audiencesJour.length > 1 ? 's' : ''}</div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Dialog Détails Salle */}
        <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
          <DialogContent className="max-w-2xl">
            {selectedSalle && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    {selectedSalle.nom}
                  </DialogTitle>
                  <DialogDescription>Détails et planning de la salle</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-muted-foreground text-xs">Capacité</Label>
                      <p className="font-medium">{selectedSalle.capacite} places</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground text-xs">Étage</Label>
                      <p className="font-medium">{selectedSalle.etage}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground text-xs">Type</Label>
                      <Badge>{selectedSalle.type}</Badge>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-muted-foreground text-xs">Statut</Label>
                      <Badge variant={selectedSalle.disponible ? "default" : "secondary"}>
                        {selectedSalle.disponible ? "Disponible" : "Indisponible"}
                      </Badge>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <Label className="text-muted-foreground text-xs">Équipements</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedSalle.equipements.map(equip => (
                        <Badge key={equip} variant="outline">{equip}</Badge>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-muted-foreground text-xs mb-2 block">
                      Audiences du {format(parseISO(selectedDate), "d MMMM yyyy", { locale: fr })}
                    </Label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {audiences.filter(a => a.salle === selectedSalle.nom && a.date === selectedDate).length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">Aucune audience programmée</p>
                      ) : (
                        audiences.filter(a => a.salle === selectedSalle.nom && a.date === selectedDate).map(audience => (
                          <div key={audience.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                            <div>
                              <p className="font-medium text-sm">{audience.numero}</p>
                              <p className="text-xs text-muted-foreground">{audience.parties}</p>
                            </div>
                            <Badge variant="outline">{audience.heure}</Badge>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default GestionSalles;
