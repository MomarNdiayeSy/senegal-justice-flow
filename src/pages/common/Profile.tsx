import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, Building2, Briefcase, Edit2, Save, X, Clock, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useApp } from "@/contexts/AppContext";
import DashboardLayout from "@/components/DashboardLayout";

const Profile = () => {
  const { currentUser, updateUser, logs } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(currentUser?.photo || "");
  const [formData, setFormData] = useState({
    nom: currentUser?.nom || "",
    prenom: currentUser?.prenom || "",
    email: currentUser?.email || "",
    telephone: currentUser?.telephone || "",
    tribunal: currentUser?.tribunal || "",
    role: currentUser?.role || "",
    photo: currentUser?.photo || "",
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  // Get user's connection logs
  const userLogs = logs
    .filter(log => 
      log.userId === currentUser?.id && 
      (log.action === "Connexion" || log.action === "Déconnexion")
    )
    .slice(0, 5); // Last 5 connections

  if (!currentUser) {
    navigate("/auth");
    return null;
  }

  const handleSave = () => {
    if (!currentUser) return;
    
    // Update user with new data
    updateUser(currentUser.id, {
      nom: formData.nom,
      prenom: formData.prenom,
      email: formData.email,
      telephone: formData.telephone,
      tribunal: formData.tribunal,
      photo: photoUrl
    });
    
    toast({
      title: "✓ Profil mis à jour",
      description: "Vos informations ont été enregistrées avec succès.",
    });
    setIsEditing(false);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In production, upload to server
      // For now, create a local URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCancel = () => {
    setFormData({
      nom: currentUser?.nom || "",
      prenom: currentUser?.prenom || "",
      email: currentUser?.email || "",
      telephone: currentUser?.telephone || "",
      tribunal: currentUser?.tribunal || "",
      role: currentUser?.role || "",
      photo: currentUser?.photo || "",
    });
    setPhotoUrl(currentUser?.photo || "");
    setIsEditing(false);
  };

  const getInitials = () => {
    return `${currentUser?.prenom?.[0] || ""}${currentUser?.nom?.[0] || ""}`;
  };

  const getRoleLabel = (role: string) => {
    const roles: Record<string, string> = {
      admin: "Administrateur",
      greffier: "Greffier",
      juge: "Juge",
      procureur: "Procureur",
      avocat: "Avocat",
      justiciable: "Justiciable"
    };
    return roles[role] || role;
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="shadow-elegant">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-6">
                <div className="relative group">
                  <Avatar className="w-32 h-32 border-4 border-primary shadow-lg">
                    <AvatarImage src={photoUrl || currentUser?.photo} alt={`${currentUser?.prenom} ${currentUser?.nom}`} />
                    <AvatarFallback className="text-4xl bg-primary text-primary-foreground">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <label 
                      htmlFor="photo-upload" 
                      className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-smooth"
                    >
                      <Edit2 className="w-8 h-8 text-white" />
                      <input
                        id="photo-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoChange}
                      />
                    </label>
                  )}
                </div>
              </div>
              <CardTitle className="text-3xl font-bold text-primary">
                {currentUser?.prenom} {currentUser?.nom}
              </CardTitle>
              <CardDescription className="text-lg mt-2">
                {getRoleLabel(currentUser?.role)}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="flex justify-end gap-2">
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)} variant="default">
                    <Edit2 className="mr-2 w-4 h-4" />
                    Modifier le profil
                  </Button>
                ) : (
                  <>
                    <Button onClick={handleCancel} variant="outline">
                      <X className="mr-2 w-4 h-4" />
                      Annuler
                    </Button>
                    <Button onClick={handleSave} variant="default">
                      <Save className="mr-2 w-4 h-4" />
                      Enregistrer
                    </Button>
                  </>
                )}
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="prenom" className="flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    Prénom
                  </Label>
                  <Input
                    id="prenom"
                    value={formData.prenom}
                    onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                    disabled={!isEditing}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nom" className="flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    Nom
                  </Label>
                  <Input
                    id="nom"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    disabled={!isEditing}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!isEditing}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telephone" className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-primary" />
                    Téléphone
                  </Label>
                  <Input
                    id="telephone"
                    value={formData.telephone}
                    onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                    disabled={!isEditing}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="tribunal" className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-primary" />
                    Tribunal
                  </Label>
                  <Input
                    id="tribunal"
                    value={formData.tribunal}
                    onChange={(e) => setFormData({ ...formData, tribunal: e.target.value })}
                    disabled={!isEditing}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-primary" />
                    Fonction
                  </Label>
                  <Input
                    value={getRoleLabel(formData.role)}
                    disabled
                    className="h-11 bg-muted"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security & Activity Section */}
          <Card className="shadow-elegant mt-6">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-primary" />
                <div>
                  <CardTitle className="text-xl">Sécurité & Activité</CardTitle>
                  <CardDescription>Historique de vos connexions récentes</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">Dernier accès</p>
                      <p className="text-sm text-muted-foreground">
                        {currentUser?.dernierAcces 
                          ? new Date(currentUser.dernierAcces).toLocaleString("fr-FR", {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })
                          : "Jamais connecté"}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">Actif</Badge>
                </div>

                {userLogs.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-muted-foreground">Historique récent</h4>
                    {userLogs.map((log) => (
                      <div 
                        key={log.id} 
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-smooth"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${
                            log.action === "Connexion" ? "bg-green-500" : "bg-gray-400"
                          }`} />
                          <div>
                            <p className="text-sm font-medium">{log.action}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(log.date).toLocaleString("fr-FR", {
                                day: "2-digit",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-mono text-muted-foreground">{log.ipAddress}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
