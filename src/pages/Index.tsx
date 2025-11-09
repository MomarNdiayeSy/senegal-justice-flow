import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Scale, Monitor, BarChart3, ArrowRight, CheckCircle2, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Shield, Sparkles, Zap, Globe, Newspaper } from "lucide-react";
import heroImage from "@/assets/hero-modern.jpg";
import featureDigital from "@/assets/feature-digital.jpg";
import featureSecure from "@/assets/feature-secure.jpg";
import featureConnected from "@/assets/feature-connected.jpg";
import Chatbot from "@/components/Chatbot";

const Index = () => {
  const navigate = useNavigate();
  const features = [
    {
      image: featureDigital,
      icon: Scale,
      title: "Justice numérique",
      description: "Planifiez, organisez et suivez toutes vos audiences judiciaires en temps réel avec une interface intuitive et moderne.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      image: featureSecure,
      icon: Shield,
      title: "Sécurité maximale",
      description: "Protection avancée des données sensibles avec cryptage de niveau bancaire et conformité aux normes internationales.",
      color: "from-purple-500 to-pink-500"
    },
    {
      image: featureConnected,
      icon: Globe,
      title: "Système connecté",
      description: "Synchronisation en temps réel entre tous les tribunaux du Sénégal pour une justice plus efficace et transparente.",
      color: "from-green-500 to-teal-500"
    }
  ];

  const benefits = [
    "Accès 24/7 pour tous les acteurs judiciaires",
    "Notifications automatiques par email et SMS",
    "Sécurité renforcée et conformité aux normes",
    "Interface intuitive et accessible à tous"
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="gradient-hero text-primary-foreground py-3 md:py-4 px-4 md:px-6 shadow-elegant backdrop-blur-xl bg-primary/95 sticky top-0 z-50"
      >
        <div className="container mx-auto flex items-center justify-between gap-2 md:gap-4">
          <motion.div 
            className="flex items-center gap-3"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <div className="relative">
              <Scale className="w-10 h-10 text-accent" />
              <motion.div
                className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <div>
              <h1 className="text-lg md:text-2xl font-bold flex items-center gap-2">
                <span className="hidden sm:inline">e-Justice Sénégal</span>
                <span className="sm:hidden">e-Justice</span>
                <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-accent" />
              </h1>
              <p className="text-xs opacity-90 hidden md:block">Ministère de la Justice</p>
            </div>
          </motion.div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className="bg-white/10 border-white/20 hover:bg-white/20 text-white hover:scale-105 transition-smooth"
              onClick={() => navigate("/auth")}
            >
              <Zap className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Se connecter</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className="text-white hover:bg-white/10 hidden sm:flex"
              onClick={() => navigate("/blog")}
            >
              <Newspaper className="w-4 h-4 mr-2" />
              Blog
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-5" />
        <motion.div 
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.05, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <div className="absolute top-20 left-10 w-32 h-32 bg-accent/20 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
        </motion.div>
        
        <div className="container mx-auto px-4 md:px-6 py-10 md:py-20">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <motion.h2 
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6 leading-tight"
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Vers une justice plus{" "}
                <span className="text-accent inline-block">
                  <motion.span
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    rapide
                  </motion.span>
                </span>,{" "}
                <span className="text-accent inline-block">
                  <motion.span
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    transparente
                  </motion.span>
                </span> et{" "}
                <span className="text-accent inline-block">
                  <motion.span
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                  >
                    connectée
                  </motion.span>
                </span>
              </motion.h2>
              <motion.p 
                className="text-base md:text-xl text-muted-foreground mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
              >
                La plateforme de digitalisation complète du suivi des audiences judiciaires au Sénégal.
              </motion.p>
              <motion.div 
                className="flex flex-wrap gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 }}
              >
                <Button 
                  size="lg" 
                  className="shadow-gold hover:shadow-gold hover:scale-105 transition-smooth"
                  onClick={() => navigate("/auth")}
                >
                  Se connecter
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => navigate("/public-display")}
                >
                  <Monitor className="mr-2 w-5 h-5" />
                  Affichage public
                </Button>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-accent/30 via-primary/30 to-accent/30 rounded-3xl blur-2xl opacity-50 animate-pulse" />
              <motion.div
                whileHover={{ scale: 1.02, rotateY: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-primary/20 rounded-2xl" />
                <img 
                  src={heroImage} 
                  alt="Justice numérique au Sénégal" 
                  className="rounded-2xl shadow-elegant w-full relative z-10 ring-2 ring-accent/50"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/50 to-transparent rounded-2xl" />
              </motion.div>
              <motion.div
                className="absolute -bottom-6 -right-6 bg-gradient-to-br from-accent to-accent/80 text-accent-foreground p-6 rounded-2xl shadow-gold backdrop-blur-sm border border-white/20"
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 1.5, type: "spring" }}
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <div className="text-4xl font-bold">45+</div>
                <div className="text-sm font-semibold">Tribunaux connectés</div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-10 md:py-20 bg-secondary/30">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4">
              Une solution complète et innovante
            </h3>
            <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Modernisez votre système judiciaire avec nos trois piliers technologiques
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -15, scale: 1.02 }}
              >
                <Card className="h-full hover:shadow-elegant transition-smooth cursor-pointer border-0 relative overflow-hidden group bg-card">
                  {/* Gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-smooth`} />
                  
                  {/* Image with overlay */}
                  <div className="relative h-48 overflow-hidden">
                    <motion.img 
                      src={feature.image} 
                      alt={feature.title}
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.6 }}
                    />
                    <div className={`absolute inset-0 bg-gradient-to-b ${feature.color} opacity-60 group-hover:opacity-40 transition-smooth`} />
                    <motion.div
                      className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow-lg"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <feature.icon className="w-8 h-8 text-primary" />
                    </motion.div>
                  </div>

                  {/* Content */}
                  <div className="p-6 relative z-10">
                    <h4 className="text-2xl font-display font-bold mb-3 group-hover:text-accent transition-smooth">
                      {feature.title}
                    </h4>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                    <motion.div
                      className="mt-4 flex items-center text-accent font-semibold opacity-0 group-hover:opacity-100 transition-smooth"
                      initial={{ x: -10 }}
                      whileHover={{ x: 0 }}
                    >
                      En savoir plus
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </motion.div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-10 md:py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-6">
                <span className="text-accent">Modernité</span>, <span className="text-accent">Efficacité</span>, <span className="text-accent">Transparence</span>
              </h3>
              <p className="text-lg text-muted-foreground mb-8">
                Une plateforme conçue pour tous les acteurs du système judiciaire sénégalais.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ x: -50, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle2 className="w-6 h-6 text-success flex-shrink-0" />
                    <span className="text-lg">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ x: 100, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-6"
            >
              {[
                { label: "Audiences gérées", value: "12,450+" },
                { label: "Utilisateurs actifs", value: "3,200+" },
                { label: "Tribunaux connectés", value: "45" },
                { label: "Taux de satisfaction", value: "98%" }
              ].map((stat, index) => (
                <Card key={index} className="p-6 text-center gradient-card border-0 shadow-md">
                  <div className="text-4xl font-bold text-accent mb-2">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </Card>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="gradient-hero text-primary-foreground py-10 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <motion.div
            className="absolute top-0 left-0 w-full h-full"
            animate={{
              backgroundImage: [
                "radial-gradient(circle at 20% 50%, hsl(45 64% 53% / 0.3) 0%, transparent 50%)",
                "radial-gradient(circle at 80% 50%, hsl(45 64% 53% / 0.3) 0%, transparent 50%)",
                "radial-gradient(circle at 20% 50%, hsl(45 64% 53% / 0.3) 0%, transparent 50%)",
              ],
            }}
            transition={{ duration: 5, repeat: Infinity }}
          />
        </div>
        
        <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-6">
              Prêt à moderniser votre système judiciaire ?
            </h3>
            <p className="text-base md:text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Rejoignez les tribunaux sénégalais qui ont déjà adopté la transformation numérique.
            </p>
            <Button 
              size="lg" 
              variant="outline" 
              className="bg-white text-primary hover:bg-white/90 shadow-gold hover:scale-105 transition-smooth"
              onClick={() => navigate("/auth")}
            >
              Accéder à la plateforme
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-8 md:py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Scale className="w-8 h-8 text-accent" />
                <div>
                  <div className="font-display font-bold text-lg">e-Justice Sénégal</div>
                  <div className="text-xs opacity-80">SmartCourt</div>
                </div>
              </div>
              <p className="text-sm opacity-80 leading-relaxed">
                Plateforme officielle de digitalisation du suivi des audiences judiciaires au Sénégal.
              </p>
            </div>

            {/* Navigation */}
            <div>
              <h4 className="font-bold mb-4">Navigation</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <button onClick={() => navigate("/auth")} className="opacity-80 hover:opacity-100 transition-smooth hover:text-accent">
                    Se connecter
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate("/blog")} className="opacity-80 hover:opacity-100 transition-smooth hover:text-accent">
                    Actualités
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate("/public-display")} className="opacity-80 hover:opacity-100 transition-smooth hover:text-accent">
                    Affichage public
                  </button>
                </li>
                <li>
                  <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="opacity-80 hover:opacity-100 transition-smooth hover:text-accent">
                    À propos
                  </button>
                </li>
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="font-bold mb-4">Services</h4>
              <ul className="space-y-2 text-sm">
                <li className="opacity-80">Gestion des audiences</li>
                <li className="opacity-80">Affichage numérique</li>
                <li className="opacity-80">Statistiques & Analytics</li>
                <li className="opacity-80">Support technique</li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2 opacity-80">
                  <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>Ministère de la Justice, Dakar, Sénégal</span>
                </li>
                <li className="flex items-center gap-2 opacity-80">
                  <Phone className="w-4 h-4 shrink-0" />
                  <span>+221 33 889 29 29</span>
                </li>
                <li className="flex items-center gap-2 opacity-80">
                  <Mail className="w-4 h-4 shrink-0" />
                  <span>contact@justice.sn</span>
                </li>
              </ul>
              
              {/* Social Links */}
              <div className="flex gap-3 mt-4">
                <motion.a
                  href="#"
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-smooth"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Facebook className="w-4 h-4" />
                </motion.a>
                <motion.a
                  href="#"
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-smooth"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Twitter className="w-4 h-4" />
                </motion.a>
                <motion.a
                  href="#"
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-smooth"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Linkedin className="w-4 h-4" />
                </motion.a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm opacity-80">
              © 2025 Ministère de la Justice du Sénégal. Tous droits réservés.
            </p>
            <div className="flex gap-6 text-sm">
              <button className="opacity-80 hover:opacity-100 transition-smooth hover:text-accent">
                Mentions légales
              </button>
              <button className="opacity-80 hover:opacity-100 transition-smooth hover:text-accent">
                Politique de confidentialité
              </button>
              <button className="opacity-80 hover:opacity-100 transition-smooth hover:text-accent flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Sécurité
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Chatbot Assistant */}
      <Chatbot />
    </div>
  );
};

export default Index;
