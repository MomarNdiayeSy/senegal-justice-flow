import { useState } from "react";
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
  const { users, addUser, setCurrentUser } = useApp();

  const roles = [
    { value: "admin", label: "Administrateur" },
    { value: "greffier", label: "Greffier" },
    { value: "juge", label: "Juge" },
    { value: "avocat", label: "Avocat" },
    { value: "justiciable", label: "Justiciable" },
    { value: "public", label: "Public" }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulation de connexion
    setTimeout(() => {
      toast({
        title: "Connexion réussie",
        description: `Bienvenue sur e-Justice Sénégal`,
      });
      setIsLoading(false);
      navigate("/dashboard");
    }, 1500);
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
          <CardHeader className="text-center pb-8 pt-10">
            <div className="flex justify-center mb-6">
              <div className="p-5 rounded-full bg-primary/10 shadow-md">
                <Scale className="w-16 h-16 text-primary" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-primary mb-2">e-Justice Sénégal</CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Ministère de la Justice
            </CardDescription>
            <CardDescription className="text-sm mt-1">
              Connectez-vous à votre espace professionnel
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

                  <div className="space-y-2">
                    <Label htmlFor="login-role">Rôle</Label>
                    <Select
                      value={loginData.role}
                      onValueChange={(value: UserRole) => setLoginData({ ...loginData, role: value })}
                      required
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Sélectionnez votre rôle" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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

                  <div className="text-center text-sm text-muted-foreground">
                    <a href="#" className="hover:text-accent transition-smooth">
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
                  setTimeout(() => {
                    const newUser = {
                      ...signupData,
                      id: `user-${Date.now()}`,
                      dateCreation: new Date().toISOString(),
                    };
                    addUser(newUser);
                    setCurrentUser(newUser);
                    toast({
                      title: "Inscription réussie",
                      description: `Bienvenue ${signupData.prenom} ${signupData.nom}`,
                    });
                    setIsLoading(false);
                    navigate("/dashboard");
                  }, 1500);
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
                      onValueChange={(value: UserRole) => setSignupData({ ...signupData, role: value })}
                      required
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Sélectionnez votre rôle" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

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
