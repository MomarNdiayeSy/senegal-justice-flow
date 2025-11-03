import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Scale, Monitor, BarChart3, ArrowRight, CheckCircle2, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Shield } from "lucide-react";
import heroImage from "@/assets/hero-justice.jpg";
import iconGestion from "@/assets/icon-gestion.png";
import iconAffichage from "@/assets/icon-affichage.png";
import iconStats from "@/assets/icon-stats.png";

const Index = () => {
  const navigate = useNavigate();
  const features = [
    {
      icon: iconGestion,
      title: "Gestion en ligne des audiences",
      description: "Planifiez, organisez et suivez toutes vos audiences judiciaires en temps réel avec une interface intuitive."
    },
    {
      icon: iconAffichage,
      title: "Affichage public numérique",
      description: "Informez le public avec des écrans numériques modernes affichant les plannings d'audiences en direct."
    },
    {
      icon: iconStats,
      title: "Statistiques intelligentes",
      description: "Analysez les performances et optimisez les processus avec des tableaux de bord détaillés."
    }
  ];

  const benefits = [
    "Accès 24/7 pour tous les acteurs judiciaires",
    "Notifications automatiques par email et SMS",
    "Sécurité renforcée et conformité aux normes",
    "Support multilingue et interface accessible"
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="gradient-hero text-primary-foreground py-4 px-6 shadow-elegant"
      >
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Scale className="w-10 h-10 text-accent" />
            <div>
              <h1 className="text-2xl font-bold">e-Justice Sénégal</h1>
              <p className="text-xs opacity-90">Ministère de la Justice</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="bg-white/10 border-white/20 hover:bg-white/20 text-white"
            onClick={() => navigate("/auth")}
          >
            Se connecter
          </Button>
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
        
        <div className="container mx-auto px-6 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <motion.h2 
                className="text-5xl md:text-6xl font-display font-bold mb-6 leading-tight"
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
                className="text-xl text-muted-foreground mb-8"
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
                  Découvrir SmartCourt
                </Button>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="relative"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <img 
                  src={heroImage} 
                  alt="Justice numérique au Sénégal" 
                  className="rounded-2xl shadow-elegant w-full"
                />
              </motion.div>
              <motion.div
                className="absolute -bottom-6 -right-6 bg-accent text-accent-foreground p-4 rounded-xl shadow-gold"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.5, type: "spring" }}
              >
                <div className="text-3xl font-bold">45+</div>
                <div className="text-sm">Tribunaux</div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h3 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Une solution complète et innovante
            </h3>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Modernisez votre système judiciaire avec nos trois piliers technologiques
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
              >
                <Card className="p-8 h-full hover:shadow-elegant transition-smooth cursor-pointer gradient-card border-0 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-smooth" />
                  <motion.img 
                    src={feature.icon} 
                    alt={feature.title}
                    className="w-20 h-20 mb-6 rounded-xl relative z-10"
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  />
                  <h4 className="text-2xl font-display font-bold mb-4 relative z-10">{feature.title}</h4>
                  <p className="text-muted-foreground leading-relaxed relative z-10">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
            >
              <h3 className="text-4xl md:text-5xl font-display font-bold mb-6">
                Pourquoi choisir e-Justice ?
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
      <section className="gradient-hero text-primary-foreground py-20 relative overflow-hidden">
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
        
        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
          >
            <h3 className="text-4xl md:text-5xl font-display font-bold mb-6">
              Prêt à moderniser votre système judiciaire ?
            </h3>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
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
      <footer className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
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
    </div>
  );
};

export default Index;
