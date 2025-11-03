import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Scale, Monitor, BarChart3, ArrowRight, CheckCircle2 } from "lucide-react";
import heroImage from "@/assets/hero-justice.jpg";
import iconGestion from "@/assets/icon-gestion.png";
import iconAffichage from "@/assets/icon-affichage.png";
import iconStats from "@/assets/icon-stats.png";

const Index = () => {
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
          <Link to="/auth">
            <Button variant="outline" className="bg-white/10 border-white/20 hover:bg-white/20 text-white">
              Se connecter
            </Button>
          </Link>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-5" />
        <div className="container mx-auto px-6 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Vers une justice plus{" "}
                <span className="text-accent">rapide</span>,{" "}
                <span className="text-accent">transparente</span> et{" "}
                <span className="text-accent">connectée</span>
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                La plateforme de digitalisation complète du suivi des audiences judiciaires au Sénégal.
              </p>
              <div className="flex gap-4">
                <Link to="/auth">
                  <Button size="lg" className="shadow-gold hover:shadow-gold hover:scale-105 transition-smooth">
                    Commencer
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/public-display">
                  <Button size="lg" variant="outline">
                    <Monitor className="mr-2 w-5 h-5" />
                    Affichage public
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="relative"
            >
              <img 
                src={heroImage} 
                alt="Justice numérique" 
                className="rounded-2xl shadow-elegant w-full"
              />
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
            <h3 className="text-4xl font-bold mb-4">
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
              >
                <Card className="p-8 h-full hover:shadow-elegant transition-smooth cursor-pointer gradient-card border-0">
                  <img 
                    src={feature.icon} 
                    alt={feature.title}
                    className="w-20 h-20 mb-6 rounded-xl"
                  />
                  <h4 className="text-2xl font-bold mb-4">{feature.title}</h4>
                  <p className="text-muted-foreground leading-relaxed">
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
              <h3 className="text-4xl font-bold mb-6">
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
      <section className="gradient-hero text-primary-foreground py-20">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
          >
            <h3 className="text-4xl font-bold mb-6">
              Prêt à moderniser votre système judiciaire ?
            </h3>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Rejoignez les tribunaux sénégalais qui ont déjà adopté la transformation numérique.
            </p>
            <Link to="/auth">
              <Button size="lg" variant="outline" className="bg-white text-primary hover:bg-white/90 shadow-gold">
                Accéder à la plateforme
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-8">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Scale className="w-6 h-6 text-accent" />
            <span className="font-bold">e-Justice Sénégal</span>
          </div>
          <p className="text-sm opacity-80">
            © 2025 Ministère de la Justice du Sénégal. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
