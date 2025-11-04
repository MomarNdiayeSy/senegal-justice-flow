import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Edit, Trash2, Eye, MoreVertical } from "lucide-react";
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
  DialogFooter
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DashboardLayout from "@/components/DashboardLayout";
import { useApp, UserRole } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";

const Users = () => {
  const { users, addUser, updateUser, deleteUser } = useApp();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    email: "",
    nom: "",
    prenom: "",
    role: "" as UserRole,
    telephone: "",
    tribunal: ""
  });

  const roleLabels: Record<UserRole, string> = {
    admin: "Administrateur",
    greffier: "Greffier",
    juge: "Juge",
    procureur: "Procureur",
    avocat: "Avocat",
    justiciable: "Justiciable"
  };

  const roleColors: Record<UserRole, string> = {
    admin: "bg-red-500 hover:bg-red-600",
    greffier: "bg-blue-500 hover:bg-blue-600",
    juge: "bg-purple-500 hover:bg-purple-600",
    procureur: "bg-amber-500 hover:bg-amber-600",
    avocat: "bg-green-500 hover:bg-green-600",
    justiciable: "bg-gray-500 hover:bg-gray-600"
  };

  const filteredUsers = users.filter(user =>
    user.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Email invalide",
        description: "Veuillez entrer une adresse email valide",
        variant: "destructive"
      });
      return;
    }

    // Validate phone number
    if (!formData.telephone.match(/^\+?[\d\s-]+$/)) {
      toast({
        title: "Téléphone invalide",
        description: "Veuillez entrer un numéro de téléphone valide",
        variant: "destructive"
      });
      return;
    }
    
    if (editingUser) {
      updateUser(editingUser.id, formData);
      toast({
        title: "✓ Utilisateur modifié",
        description: `${formData.prenom} ${formData.nom} a été mis à jour.`
      });
    } else {
      // Check if email already exists
      if (users.find(u => u.email === formData.email)) {
        toast({
          title: "Email déjà utilisé",
          description: "Cet email est déjà associé à un autre utilisateur",
          variant: "destructive"
        });
        return;
      }
      
      addUser(formData);
      toast({
        title: "✓ Utilisateur créé",
        description: `${formData.prenom} ${formData.nom} a été ajouté avec succès. Mot de passe par défaut: 123456`
      });
    }
    
    setDialogOpen(false);
    setEditingUser(null);
    setFormData({
      email: "",
      nom: "",
      prenom: "",
      role: "" as UserRole,
      telephone: "",
      tribunal: ""
    });
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      nom: user.nom,
      prenom: user.prenom,
      role: user.role,
      telephone: user.telephone,
      tribunal: user.tribunal
    });
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    const user = users.find(u => u.id === id);
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${user?.prenom} ${user?.nom} ? Cette action est irréversible.`)) {
      deleteUser(id);
      toast({
        title: "✓ Utilisateur supprimé",
        description: `${user?.prenom} ${user?.nom} a été supprimé avec succès.`
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Card className="shadow-md border-0">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle className="text-2xl">Gestion des utilisateurs</CardTitle>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="shadow-gold hover:shadow-gold" onClick={() => {
                    setEditingUser(null);
                    setFormData({
                      email: "",
                      nom: "",
                      prenom: "",
                      role: "" as UserRole,
                      telephone: "",
                      tribunal: ""
                    });
                  }}>
                    <Plus className="w-5 h-5 mr-2" />
                    Nouvel utilisateur
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingUser ? "Modifier l'utilisateur" : "Créer un nouvel utilisateur"}
                    </DialogTitle>
                    <DialogDescription>
                      Remplissez les informations de l'utilisateur
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Prénom</Label>
                        <Input
                          required
                          value={formData.prenom}
                          onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                          placeholder="Prénom"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Nom</Label>
                        <Input
                          required
                          value={formData.nom}
                          onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                          placeholder="Nom"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                          required
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="email@justice.sn"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Téléphone</Label>
                        <Input
                          required
                          value={formData.telephone}
                          onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                          placeholder="+221 77 123 45 67"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Rôle</Label>
                        <Select
                          required
                          value={formData.role}
                          onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un rôle" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(roleLabels).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Tribunal</Label>
                        <Input
                          required
                          value={formData.tribunal}
                          onChange={(e) => setFormData({ ...formData, tribunal: e.target.value })}
                          placeholder="Tribunal de Dakar"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" className="w-full">
                        {editingUser ? "Mettre à jour" : "Créer"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom, prénom ou email..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              {filteredUsers.map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-md transition-smooth">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-bold text-lg">
                            {user.prenom[0]}{user.nom[0]}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-lg">
                              {user.prenom} {user.nom}
                            </h3>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            <div className="flex items-center gap-3 mt-2 text-sm">
                              <span className="text-muted-foreground">{user.telephone}</span>
                              <span className="text-muted-foreground">•</span>
                              <span className="text-muted-foreground">{user.tribunal}</span>
                            </div>
                          </div>
                          <Badge className={`${roleColors[user.role]} text-white`}>
                            {roleLabels[user.role]}
                          </Badge>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-5 h-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(user)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Modifier
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(user.id)} className="text-destructive">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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

export default Users;
