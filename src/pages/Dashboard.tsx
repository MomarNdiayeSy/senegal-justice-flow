import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Filter, MoreVertical, Calendar as CalendarIcon, Clock, MapPin, User } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DashboardLayout from "@/components/DashboardLayout";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { audiences, users, addAudience } = useApp();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    numero: "",
    parties: "",
    date: "",
    heure: "",
    salle: "",
    jugeId: "",
    procureurId: "",
    avocatIds: [] as string[],
    justiciableId: "",
    statut: "prevue" as "prevue" | "en_cours" | "reportee" | "terminee"
  });

  const getStatusBadge = (statut: "prevue" | "en_cours" | "reportee" | "terminee") => {
    const variants = {
      prevue: { label: "Prévue", className: "bg-blue-500 hover:bg-blue-600" },
      en_cours: { label: "En cours", className: "bg-amber-500 hover:bg-amber-600" },
      reportee: { label: "Reportée", className: "bg-purple-500 hover:bg-purple-600" },
      terminee: { label: "Terminée", className: "bg-green-500 hover:bg-green-600" }
    };

    const variant = variants[statut];
    return (
      <Badge className={`${variant.className} text-white`}>
        {variant.label}
      </Badge>
    );
  };

  const stats = [
    { label: "Total audiences", value: audiences.length, color: "text-blue-600" },
    { label: "En cours", value: audiences.filter(a => a.statut === "en_cours").length, color: "text-amber-600" },
    { label: "Prévues", value: audiences.filter(a => a.statut === "prevue").length, color: "text-green-600" },
    { label: "Reportées", value: audiences.filter(a => a.statut === "reportee").length, color: "text-purple-600" }
  ];

  const filteredAudiences = audiences.filter(
    audience =>
      audience.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      audience.parties.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addAudience(formData);
    toast({
      title: "Audience créée",
      description: `L'audience ${formData.numero} a été créée.`
    });
    setDialogOpen(false);
    setFormData({
      numero: "",
      parties: "",
      date: "",
      heure: "",
      salle: "",
      jugeId: "",
      procureurId: "",
      avocatIds: [],
      justiciableId: "",
      statut: "prevue"
    });
  };

  const juges = users.filter(u => u.role === "juge");
  const avocats = users.filter(u => u.role === "avocat");

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="gradient-card border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                      <p className={`text-4xl font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-full bg-secondary flex items-center justify-center ${stat.color}`}>
                      <CalendarIcon className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Actions & Search */}
        <Card className="shadow-md border-0">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle className="text-2xl">Gestion des audiences</CardTitle>
              <div className="flex gap-3">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="shadow-gold hover:shadow-gold">
                      <Plus className="w-5 h-5 mr-2" />
                      Nouvelle audience
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Créer une nouvelle audience</DialogTitle>
                    <DialogDescription>
                      Remplissez les informations de l'audience
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Numéro d'affaire</Label>
                        <Input 
                          required
                          value={formData.numero}
                          onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                          placeholder="AUD-2025-XXX" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Parties</Label>
                        <Input 
                          required
                          value={formData.parties}
                          onChange={(e) => setFormData({ ...formData, parties: e.target.value })}
                          placeholder="Partie A vs Partie B" 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Date</Label>
                        <Input 
                          required
                          type="date" 
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Heure</Label>
                        <Input 
                          required
                          type="time" 
                          value={formData.heure}
                          onChange={(e) => setFormData({ ...formData, heure: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Salle</Label>
                        <Select
                          required
                          value={formData.salle}
                          onValueChange={(value) => setFormData({ ...formData, salle: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Salle 1">Salle 1</SelectItem>
                            <SelectItem value="Salle 2">Salle 2</SelectItem>
                            <SelectItem value="Salle 3">Salle 3</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Juge</Label>
                        <Select
                          required
                          value={formData.jugeId}
                          onValueChange={(value) => setFormData({ ...formData, jugeId: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner" />
                          </SelectTrigger>
                          <SelectContent>
                            {juges.map((juge) => (
                              <SelectItem key={juge.id} value={juge.id}>
                                {juge.prenom} {juge.nom}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button type="submit" className="w-full">
                      Créer l'audience
                    </Button>
                  </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par numéro ou parties..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="w-5 h-5" />
              </Button>
            </div>

            {/* Audiences List */}
            <div className="space-y-4">
              {filteredAudiences.map((audience, index) => (
                <motion.div
                  key={audience.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-md transition-smooth border-l-4 border-l-accent">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-bold">{audience.numero}</h3>
                            {getStatusBadge(audience.statut)}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <User className="w-4 h-4" />
                              <span>{audience.parties}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <CalendarIcon className="w-4 h-4" />
                              <span>{new Date(audience.date).toLocaleDateString('fr-FR')}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Clock className="w-4 h-4" />
                              <span>{audience.heure}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <MapPin className="w-4 h-4" />
                              <span>{audience.salle} • {users.find(u => u.id === audience.jugeId)?.nom || "Juge"}</span>
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-5 h-5" />
                        </Button>
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

export default Dashboard;
