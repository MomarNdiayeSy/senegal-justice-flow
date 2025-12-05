import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Scale, Eye, EyeOff, LogIn, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useApp, UserRole } from "@/contexts/AppContext";

const Auth = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
    role: "" as UserRole
  });
  const [signupData, setSignupData] = useState({
    email: "",
    password: "",
    nom: "",
    prenom: "",
    role: "" as UserRole,
    telephone: "",
    tribunal: ""
  });
  const navigate = useNavigate();
  const { toast } = useToast();
  const { users, addUser, setCurrentUser, login, currentUser } = useApp();

  // Rediriger si déjà connecté (dans useEffect pour éviter le warning React)
  useEffect(() => {
    if (currentUser) {
      navigate("/dashboard");
    }
  }, [currentUser, navigate]);

  // Rôles disponibles pour l'inscription (sans Admin)
  const signupRoles = [
    { value: "greffier", label: "Greffier", needsTribunal: true },
    { value: "juge", label: "Juge", needsTribunal: true },
    { value: "procureur", label: "Procureur", needsTribunal: true },
    { value: "avocat", label: "Avocat", needsTribunal: false },
    { value: "justiciable", label: "Justiciable", needsTribunal: false }
  ];

  // Vérifier si le rôle sélectionné nécessite un tribunal
  const selectedRoleConfig = signupRoles.find(r => r.value === signupData.role);
  const needsTribunal = selectedRoleConfig?.needsTribunal ?? false;

  const getRoleDashboardPath = (role: UserRole): string => {
    switch (role) {
      case "admin":
        return "/admin/dashboard";
      case "greffier":
        return "/greffier/dashboard";
      case "juge":
        return "/juge/dashboard";
      case "procureur":
        return "/procureur/dashboard";
      case "avocat":
        return "/avocat/dashboard";
      case "justiciable":
        return "/justiciable/dashboard";
      default:
        return "/dashboard";
    }
  };

  const validatePassword = (password: string): { valid: boolean; message?: string } => {
    if (password.length < 6) {
      return { valid: false, message: "Le mot de passe doit contenir au moins 6 caractères" };
    }
    return { valid: true };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate inputs
    if (!loginData.email || !loginData.password) {
      toast({
        title: "Erreur de validation",
        description: "Veuillez remplir tous les champs",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }

    setTimeout(() => {
      const result = login(loginData.email, loginData.password);
      
      if (result.success && result.user) {
        toast({
          title: "✓ Connexion réussie",
          description: `Bienvenue ${result.user.prenom} ${result.user.nom}`,
        });
        setIsLoading(false);
        navigate(getRoleDashboardPath(result.user.role));
      } else {
        toast({
          title: "Erreur de connexion",
          description: result.message || "Email ou mot de passe incorrect",
          variant: "destructive"
        });
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-auth p-6">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-elegant border-0 bg-white">
          <CardHeader className="text-center pb-6 pt-8">
            <div className="flex justify-center mb-4">
              <motion.div 
                className="p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 shadow-lg"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Scale className="w-12 h-12 text-primary" />
              </motion.div>
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              e-Justice Sénégal
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-1">
              Plateforme de Gestion Judiciaire
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Connexion</TabsTrigger>
                <TabsTrigger value="signup">S'inscrire</TabsTrigger>
              </TabsList>

              {/* Onglet Connexion */}
              <TabsContent value="login">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Adresse email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="votre.email@justice.sn"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Mot de passe</Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        required
                        className="h-12 pr-12"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-2 h-8 w-8 p-0"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 shadow-gold hover:shadow-gold hover:scale-105 transition-smooth"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                        />
                        Connexion en cours...
                      </>
                    ) : (
                      <>
                        <LogIn className="mr-2 w-5 h-5" />
                        Se connecter
                      </>
                    )}
                  </Button>

                  <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded border-border" />
                      <span className="text-muted-foreground">Se souvenir de moi</span>
                    </label>
                    <a href="#" className="text-primary hover:text-accent transition-smooth font-medium">
                      Mot de passe oublié ?
                    </a>
                  </div>
                </form>
              </TabsContent>

              {/* Onglet Inscription */}
              <TabsContent value="signup">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  setIsLoading(true);
                  
                  // Validate inputs
                  if (!signupData.email || !signupData.password || !signupData.nom || !signupData.prenom) {
                    toast({
                      title: "Erreur de validation",
                      description: "Veuillez remplir tous les champs obligatoires",
                      variant: "destructive"
                    });
                    setIsLoading(false);
                    return;
                  }

                  // Validate password
                  const passwordValidation = validatePassword(signupData.password);
                  if (!passwordValidation.valid) {
                    toast({
                      title: "Mot de passe invalide",
                      description: passwordValidation.message,
                      variant: "destructive"
                    });
                    setIsLoading(false);
                    return;
                  }

                  // Validate email format
                  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                  if (!emailRegex.test(signupData.email)) {
                    toast({
                      title: "Email invalide",
                      description: "Veuillez entrer une adresse email valide",
                      variant: "destructive"
                    });
                    setIsLoading(false);
                    return;
                  }

                  setTimeout(() => {
                    // Vérifier si l'email existe déjà
                    if (users.find(u => u.email === signupData.email)) {
                      toast({
                        title: "Erreur d'inscription",
                        description: "Cet email est déjà utilisé",
                        variant: "destructive"
                      });
                      setIsLoading(false);
                      return;
                    }

                    const newUser = {
                      email: signupData.email,
                      nom: signupData.nom,
                      prenom: signupData.prenom,
                      role: signupData.role,
                      telephone: signupData.telephone,
                      tribunal: needsTribunal ? signupData.tribunal : "N/A",
                      actif: false, // Compte inactif jusqu'à activation par le greffier
                    };
                    addUser(newUser);
                    toast({
                      title: "✓ Inscription enregistrée",
                      description: "Votre demande a été enregistrée. Vous recevrez un email dès que votre compte sera activé par le greffier.",
                      duration: 8000,
                    });
                    setIsLoading(false);
                    // Ne pas connecter automatiquement - le compte n'est pas encore activé
                    // Réinitialiser le formulaire
                    setSignupData({
                      email: "",
                      password: "",
                      nom: "",
                      prenom: "",
                      role: "" as UserRole,
                      telephone: "",
                      tribunal: ""
                    });
                  }, 800);
                }} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-prenom">Prénom</Label>
                      <Input
                        id="signup-prenom"
                        type="text"
                        placeholder="Prénom"
                        value={signupData.prenom}
                        onChange={(e) => setSignupData({ ...signupData, prenom: e.target.value })}
                        required
                        className="h-12"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-nom">Nom</Label>
                      <Input
                        id="signup-nom"
                        type="text"
                        placeholder="Nom"
                        value={signupData.nom}
                        onChange={(e) => setSignupData({ ...signupData, nom: e.target.value })}
                        required
                        className="h-12"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Adresse email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="votre.email@justice.sn"
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      required
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-telephone">Téléphone</Label>
                    <Input
                      id="signup-telephone"
                      type="tel"
                      placeholder="+221 XX XXX XX XX"
                      value={signupData.telephone}
                      onChange={(e) => setSignupData({ ...signupData, telephone: e.target.value })}
                      required
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Mot de passe</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={signupData.password}
                        onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                        required
                        className="h-12 pr-12"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-2 h-8 w-8 p-0"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-role">Rôle</Label>
                    <Select
                      value={signupData.role}
                      onValueChange={(value: UserRole) => setSignupData({ ...signupData, role: value, tribunal: "" })}
                      required
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Sélectionnez votre rôle" />
                      </SelectTrigger>
                      <SelectContent>
                        {signupRoles.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {needsTribunal && (
                    <div className="space-y-2">
                      <Label htmlFor="signup-tribunal">Tribunal</Label>
                      <Input
                        id="signup-tribunal"
                        type="text"
                        placeholder="Tribunal de Dakar"
                        value={signupData.tribunal}
                        onChange={(e) => setSignupData({ ...signupData, tribunal: e.target.value })}
                        required
                        className="h-12"
                      />
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-12 shadow-gold hover:shadow-gold hover:scale-105 transition-smooth"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                        />
                        Inscription en cours...
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 w-5 h-5" />
                        S'inscrire
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-6"
        >
          <button 
            onClick={() => navigate("/")} 
            className="text-primary hover:text-accent transition-smooth cursor-pointer font-medium"
          >
            ← Retour à l'accueil
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Auth;
