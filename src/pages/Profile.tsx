import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Phone, Building2, Briefcase, Edit2, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useApp } from "@/contexts/AppContext";
import DashboardLayout from "@/components/DashboardLayout";

const Profile = () => {
  const { currentUser } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nom: currentUser?.nom || "",
    prenom: currentUser?.prenom || "",
    email: currentUser?.email || "",
    telephone: currentUser?.telephone || "",
    tribunal: currentUser?.tribunal || "",
    role: currentUser?.role || "",
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  if (!currentUser) {
    navigate("/auth");
    return null;
  }

  const handleSave = () => {
    toast({
      title: "Profil mis à jour",
      description: "Vos informations ont été enregistrées avec succès.",
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      nom: currentUser?.nom || "",
      prenom: currentUser?.prenom || "",
      email: currentUser?.email || "",
      telephone: currentUser?.telephone || "",
      tribunal: currentUser?.tribunal || "",
      role: currentUser?.role || "",
    });
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
      avocat: "Avocat",
      justiciable: "Justiciable",
      public: "Public",
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
                <Avatar className="w-32 h-32 border-4 border-primary shadow-lg">
                  <AvatarImage src={currentUser?.photo} alt={`${currentUser?.prenom} ${currentUser?.nom}`} />
                  <AvatarFallback className="text-4xl bg-primary text-primary-foreground">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
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
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
