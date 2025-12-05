import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Plus, Edit, Trash2, Search, UserCheck, Shield, Mail, Phone, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useApp, UserRole } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/DashboardLayout";

const GreffierUsers = () => {
  const { users, addUser, updateUser, deleteUser, currentUser, addLog } = useApp();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<typeof users[0] | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("__all__");
  const [filterStatus, setFilterStatus] = useState("__all__");

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    role: "justiciable" as UserRole,
    tribunal: "Tribunal de Dakar"
  });

  // Le greffier ne peut pas gérer les admins ni les greffiers
  const manageableRoles: UserRole[] = ["juge", "procureur", "avocat", "justiciable"];
  const manageableUsers = users.filter(u => manageableRoles.includes(u.role) && u.id !== currentUser?.id);

  // Comptes en attente d'activation
  const pendingUsers = manageableUsers.filter(u => !u.actif);

  const getRoleBadge = (role: UserRole) => {
    const config: Record<UserRole, { style: string; label: string }> = {
      admin: { style: "bg-red-100 text-red-700", label: "Administrateur" },
      greffier: { style: "bg-blue-100 text-blue-700", label: "Greffier" },
      juge: { style: "bg-purple-100 text-purple-700", label: "Juge" },
      procureur: { style: "bg-indigo-100 text-indigo-700", label: "Procureur" },
      avocat: { style: "bg-teal-100 text-teal-700", label: "Avocat" },
      justiciable: { style: "bg-gray-100 text-gray-700", label: "Justiciable" }
    };
    return config[role];
  };

  const filteredUsers = manageableUsers.filter(u => {
    const matchSearch = searchTerm === "" ||
      u.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = filterRole === "__all__" || u.role === filterRole;
    const matchStatus = filterStatus === "__all__" || 
      (filterStatus === "actif" && u.actif) || 
      (filterStatus === "inactif" && !u.actif);
    return matchSearch && matchRole && matchStatus;
  });

  const handleSubmit = () => {
    if (!formData.nom || !formData.prenom || !formData.email) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    if (editingUser) {
      updateUser(editingUser.id, formData);
      toast({ title: "Utilisateur modifié", description: `${formData.prenom} ${formData.nom} a été mis à jour` });
    } else {
      addUser({ ...formData, actif: true });
      toast({ title: "Utilisateur créé", description: `${formData.prenom} ${formData.nom} a été ajouté et activé` });
    }

    addLog({
      userId: currentUser?.id || "",
      action: editingUser ? "Modification utilisateur" : "Création utilisateur",
      details: `${formData.prenom} ${formData.nom} (${formData.role})`
    });

    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (user: typeof users[0]) => {
    setEditingUser(user);
    setFormData({
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      telephone: user.telephone,
      role: user.role,
      tribunal: user.tribunal
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (user: typeof users[0]) => {
    deleteUser(user.id);
    toast({ title: "Utilisateur supprimé", description: `${user.prenom} ${user.nom} a été supprimé` });
    addLog({
      userId: currentUser?.id || "",
      action: "Suppression utilisateur",
      details: `${user.prenom} ${user.nom} supprimé`
    });
  };

  const handleActivate = (user: typeof users[0]) => {
    updateUser(user.id, { actif: true });
    toast({ 
      title: "Compte activé", 
      description: `Le compte de ${user.prenom} ${user.nom} a été activé. L'utilisateur peut maintenant se connecter.` 
    });
    addLog({
      userId: currentUser?.id || "",
      action: "Activation compte",
      details: `Compte de ${user.prenom} ${user.nom} (${user.role}) activé`
    });
  };

  const handleDeactivate = (user: typeof users[0]) => {
    updateUser(user.id, { actif: false });
    toast({ 
      title: "Compte désactivé", 
      description: `Le compte de ${user.prenom} ${user.nom} a été désactivé.`,
      variant: "destructive"
    });
    addLog({
      userId: currentUser?.id || "",
      action: "Désactivation compte",
      details: `Compte de ${user.prenom} ${user.nom} (${user.role}) désactivé`
    });
  };

  const resetForm = () => {
    setFormData({
      nom: "",
      prenom: "",
      email: "",
      telephone: "",
      role: "justiciable",
      tribunal: "Tribunal de Dakar"
    });
    setEditingUser(null);
  };

  const stats = [
    { label: "En attente", count: pendingUsers.length, color: "bg-orange-100 text-orange-700" },
    { label: "Juges", count: manageableUsers.filter(u => u.role === "juge").length, color: "bg-purple-100 text-purple-700" },
    { label: "Procureurs", count: manageableUsers.filter(u => u.role === "procureur").length, color: "bg-indigo-100 text-indigo-700" },
    { label: "Avocats", count: manageableUsers.filter(u => u.role === "avocat").length, color: "bg-teal-100 text-teal-700" },
    { label: "Justiciables", count: manageableUsers.filter(u => u.role === "justiciable").length, color: "bg-gray-100 text-gray-700" }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-primary">Gestion des Utilisateurs</h1>
            <p className="text-muted-foreground mt-1">Créer et gérer les comptes des acteurs judiciaires</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Nouvel utilisateur
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingUser ? "Modifier l'utilisateur" : "Créer un utilisateur"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Prénom *</Label>
                    <Input
                      value={formData.prenom}
                      onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                      placeholder="Prénom"
                    />
                  </div>
                  <div>
                    <Label>Nom *</Label>
                    <Input
                      value={formData.nom}
                      onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                      placeholder="Nom"
                    />
                  </div>
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <Label>Téléphone</Label>
                  <Input
                    value={formData.telephone}
                    onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                    placeholder="+221 77 123 45 67"
                  />
                </div>
                <div>
                  <Label>Rôle *</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="juge">Juge</SelectItem>
                      <SelectItem value="procureur">Procureur</SelectItem>
                      <SelectItem value="avocat">Avocat</SelectItem>
                      <SelectItem value="justiciable">Justiciable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Tribunal / Organisation</Label>
                  <Input
                    value={formData.tribunal}
                    onChange={(e) => setFormData({ ...formData, tribunal: e.target.value })}
                    placeholder="Tribunal de Dakar"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>
                    Annuler
                  </Button>
                  <Button onClick={handleSubmit}>
                    {editingUser ? "Modifier" : "Créer"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={stat.label === "En attente" && stat.count > 0 ? "border-orange-300 bg-orange-50" : ""}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold">{stat.count}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                    <Badge className={stat.color}>{stat.label.charAt(0)}</Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par nom, prénom ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filtrer par rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Tous les rôles</SelectItem>
                  <SelectItem value="juge">Juges</SelectItem>
                  <SelectItem value="procureur">Procureurs</SelectItem>
                  <SelectItem value="avocat">Avocats</SelectItem>
                  <SelectItem value="justiciable">Justiciables</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Tous les statuts</SelectItem>
                  <SelectItem value="actif">Comptes actifs</SelectItem>
                  <SelectItem value="inactif">En attente d'activation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Liste des utilisateurs ({filteredUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="hidden md:table-cell">Contact</TableHead>
                    <TableHead className="hidden lg:table-cell">Tribunal</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Aucun utilisateur trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => {
                      const roleBadge = getRoleBadge(user.role);
                      return (
                        <TableRow key={user.id} className={!user.actif ? "bg-orange-50" : ""}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-10 h-10">
                                <AvatarImage src={user.photo} />
                                <AvatarFallback>{user.prenom[0]}{user.nom[0]}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{user.prenom} {user.nom}</p>
                                <p className="text-sm text-muted-foreground md:hidden">{user.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={roleBadge.style}>{roleBadge.label}</Badge>
                          </TableCell>
                          <TableCell>
                            {user.actif ? (
                              <Badge className="bg-green-100 text-green-700">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Actif
                              </Badge>
                            ) : (
                              <Badge className="bg-orange-100 text-orange-700">
                                <XCircle className="w-3 h-3 mr-1" />
                                En attente
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="space-y-1 text-sm">
                              <div className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {user.email}
                              </div>
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Phone className="w-3 h-3" />
                                {user.telephone}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">{user.tribunal}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {!user.actif ? (
                                <Button size="sm" variant="default" onClick={() => handleActivate(user)} className="bg-green-600 hover:bg-green-700">
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                              ) : (
                                <Button size="sm" variant="outline" onClick={() => handleDeactivate(user)}>
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              )}
                              <Button size="sm" variant="outline" onClick={() => handleEdit(user)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleDelete(user)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default GreffierUsers;
