import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Scale, ArrowLeft, Search, Calendar, User, Tag, Clock, TrendingUp, Award, Newspaper, Shield, BarChart3 } from "lucide-react";
import Chatbot from "@/components/Chatbot";

interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  image: string;
  tags: string[];
  featured: boolean;
}

const articles: Article[] = [
  {
    id: "1",
    title: "Lancement officiel de e-Justice dans 10 nouveaux tribunaux",
    excerpt: "Le Ministère de la Justice annonce le déploiement de la plateforme e-Justice dans 10 tribunaux supplémentaires à travers le Sénégal.",
    content: "Dans le cadre de la modernisation du système judiciaire sénégalais, le Ministère de la Justice a procédé au lancement officiel de la plateforme e-Justice...",
    category: "Déploiement",
    author: "Direction Générale",
    date: "2025-01-15",
    readTime: "5 min",
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&h=400&fit=crop",
    tags: ["Modernisation", "Déploiement", "Tribunaux"],
    featured: true
  },
  {
    id: "2",
    title: "Nouvelle fonctionnalité : Notifications SMS en temps réel",
    excerpt: "Les justiciables peuvent désormais recevoir des alertes SMS pour le suivi de leurs dossiers et audiences.",
    content: "e-Justice introduit un nouveau service de notifications SMS permettant aux justiciables de rester informés...",
    category: "Fonctionnalité",
    author: "Équipe Technique",
    date: "2025-01-10",
    readTime: "3 min",
    image: "https://images.unsplash.com/photo-1579869847557-1f67382cc158?w=800&h=400&fit=crop",
    tags: ["SMS", "Notifications", "Innovation"],
    featured: true
  },
  {
    id: "3",
    title: "Formation de 200 greffiers à l'utilisation de la plateforme",
    excerpt: "Un programme de formation intensive a été lancé pour accompagner les greffiers dans la prise en main des outils numériques.",
    content: "Le Ministère de la Justice, en partenariat avec e-Justice, organise des sessions de formation pour les greffiers...",
    category: "Formation",
    author: "Service Formation",
    date: "2025-01-05",
    readTime: "4 min",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop",
    tags: ["Formation", "Greffiers", "Accompagnement"],
    featured: false
  },
  {
    id: "4",
    title: "Statistiques 2024 : 98% de taux de satisfaction",
    excerpt: "Le bilan annuel révèle une adoption massive de e-Justice avec un taux de satisfaction record de 98%.",
    content: "L'année 2024 marque un tournant historique pour la justice numérique au Sénégal avec plus de 12,450 audiences gérées...",
    category: "Statistiques",
    author: "Service Analytics",
    date: "2024-12-28",
    readTime: "6 min",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop",
    tags: ["Bilan", "Statistiques", "2024"],
    featured: false
  },
  {
    id: "5",
    title: "Sécurité renforcée : Certification ISO 27001",
    excerpt: "e-Justice obtient la certification ISO 27001 pour la sécurité de l'information et la protection des données.",
    content: "La plateforme e-Justice a réussi l'audit de certification ISO 27001, confirmant son engagement pour la sécurité...",
    category: "Sécurité",
    author: "Responsable Sécurité",
    date: "2024-12-20",
    readTime: "4 min",
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&h=400&fit=crop",
    tags: ["Sécurité", "Certification", "ISO"],
    featured: false
  },
  {
    id: "6",
    title: "Partenariat avec l'Union Africaine pour la justice numérique",
    excerpt: "e-Justice devient une référence continentale avec un partenariat stratégique avec l'Union Africaine.",
    content: "Le Sénégal partage son expertise en matière de justice numérique avec d'autres pays africains...",
    category: "Partenariat",
    author: "Direction Internationale",
    date: "2024-12-15",
    readTime: "5 min",
    image: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&h=400&fit=crop",
    tags: ["Partenariat", "International", "Afrique"],
    featured: false
  }
];

const categories = ["Tous", "Déploiement", "Fonctionnalité", "Formation", "Statistiques", "Sécurité", "Partenariat"];

const Blog = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tous");

  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "Tous" || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredArticle = articles.find(a => a.featured);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Déploiement": return TrendingUp;
      case "Fonctionnalité": return Award;
      case "Formation": return User;
      case "Statistiques": return BarChart3;
      case "Sécurité": return Shield;
      case "Partenariat": return Newspaper;
      default: return Tag;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="gradient-hero text-primary-foreground py-4 px-6 shadow-elegant backdrop-blur-xl bg-primary/95 sticky top-0 z-40"
      >
        <div className="container mx-auto flex items-center justify-between">
          <motion.div 
            className="flex items-center gap-3 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate("/")}
          >
            <Scale className="w-10 h-10 text-accent" />
            <div>
              <h1 className="text-2xl font-bold">e-Justice Sénégal</h1>
              <p className="text-xs opacity-90">Actualités & Blog</p>
            </div>
          </motion.div>
          <Button 
            variant="outline" 
            className="bg-white/10 border-white/20 hover:bg-white/20 text-white"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background py-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center mb-12"
          >
            <h2 className="text-5xl font-display font-bold mb-4">
              Actualités & Blog
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Suivez les dernières nouvelles de la justice numérique au Sénégal
            </p>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-4xl mx-auto space-y-4"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Rechercher des articles..."
                className="pl-12 h-12 text-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="transition-smooth"
                >
                  {category}
                </Button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Article */}
      {featuredArticle && selectedCategory === "Tous" && !searchTerm && (
        <section className="py-12">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
            >
              <Card className="overflow-hidden border-0 shadow-elegant hover:shadow-xl transition-smooth cursor-pointer" onClick={() => {}}>
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="relative h-64 md:h-full">
                    <img 
                      src={featuredArticle.image} 
                      alt={featuredArticle.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-accent text-accent-foreground font-semibold">
                        Article en vedette
                      </Badge>
                    </div>
                  </div>
                  <div className="p-8 flex flex-col justify-center">
                    <Badge variant="outline" className="w-fit mb-4">
                      {featuredArticle.category}
                    </Badge>
                    <h3 className="text-3xl font-display font-bold mb-4 hover:text-accent transition-smooth">
                      {featuredArticle.title}
                    </h3>
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      {featuredArticle.excerpt}
                    </p>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(featuredArticle.date).toLocaleDateString("fr-FR")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{featuredArticle.readTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{featuredArticle.author}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </section>
      )}

      {/* Articles Grid */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          {filteredArticles.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <Newspaper className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-2xl font-bold mb-2">Aucun article trouvé</h3>
              <p className="text-muted-foreground">
                Essayez de modifier vos critères de recherche
              </p>
            </motion.div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredArticles.map((article, index) => {
                const CategoryIcon = getCategoryIcon(article.category);
                return (
                  <motion.div
                    key={article.id}
                    initial={{ y: 30, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -10 }}
                  >
                    <Card className="h-full overflow-hidden border-0 shadow-md hover:shadow-elegant transition-smooth cursor-pointer group">
                      <div className="relative h-48 overflow-hidden">
                        <img 
                          src={article.image} 
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute top-4 left-4">
                          <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm">
                            <CategoryIcon className="w-3 h-3 mr-1" />
                            {article.category}
                          </Badge>
                        </div>
                      </div>
                      <CardHeader>
                        <h3 className="text-xl font-bold group-hover:text-accent transition-smooth line-clamp-2">
                          {article.title}
                        </h3>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-muted-foreground line-clamp-3">
                          {article.excerpt}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {article.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(article.date).toLocaleDateString("fr-FR")}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            <span>{article.readTime}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-gradient-to-b from-background to-primary/5">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center"
          >
            <h3 className="text-3xl font-display font-bold mb-4">
              Restez informé
            </h3>
            <p className="text-muted-foreground mb-6">
              Abonnez-vous à notre newsletter pour recevoir les dernières actualités
            </p>
            <div className="flex gap-2 max-w-md mx-auto">
              <Input 
                placeholder="Votre email" 
                type="email"
                className="flex-1"
              />
              <Button className="bg-accent hover:bg-accent/90">
                S'abonner
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-8">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm opacity-80">
            © 2025 Ministère de la Justice du Sénégal. Tous droits réservés.
          </p>
        </div>
      </footer>

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
};

export default Blog;
