import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User, Sparkles, Scale, FileText, Calendar, Bell, HelpCircle, Phone, Mail, ChevronRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  links?: { label: string; url: string }[];
}

interface FAQ {
  question: string;
  answer: string;
  keywords: string[];
  category: "general" | "audiences" | "dossiers" | "procedures" | "technique";
  links?: { label: string; url: string }[];
}

const faqs: FAQ[] = [
  // Général
  {
    question: "Comment créer un compte ?",
    answer: "Pour créer un compte sur e-Justice :\n\n1. Cliquez sur 'Se connecter' en haut à droite\n2. Sélectionnez 'Créer un compte'\n3. Remplissez vos informations personnelles\n4. Validez votre email\n\nVotre compte sera activé après vérification par un administrateur.",
    keywords: ["compte", "inscription", "créer", "nouveau", "enregistrer"],
    category: "general",
    links: [{ label: "Se connecter", url: "/auth" }]
  },
  {
    question: "Qui peut utiliser e-Justice ?",
    answer: "e-Justice est accessible à 6 types d'utilisateurs :\n\n👑 **Administrateur** - Supervision nationale\n📋 **Greffier** - Gestion administrative\n⚖️ **Juge** - Décisions et audiences\n🏛️ **Procureur** - Suivi des affaires pénales\n👔 **Avocat** - Gestion des dossiers clients\n👤 **Justiciable** - Consultation de son affaire",
    keywords: ["utilisateurs", "rôles", "accès", "qui", "personnes"],
    category: "general"
  },
  {
    question: "Quels tribunaux sont connectés ?",
    answer: "Plus de **45 tribunaux sénégalais** sont connectés à e-Justice :\n\n• Dakar (Tribunal de Grande Instance)\n• Thiès\n• Saint-Louis\n• Ziguinchor\n• Kaolack\n• Et bien d'autres...\n\nLe réseau s'étend progressivement à l'ensemble du territoire.",
    keywords: ["tribunaux", "connectés", "nombre", "villes", "juridictions"],
    category: "general"
  },
  {
    question: "Les données sont-elles sécurisées ?",
    answer: "Oui, e-Justice garantit une sécurité maximale :\n\n🔒 **Cryptage de niveau bancaire** (AES-256)\n🛡️ **Conformité RGPD**\n📊 **Audit des accès en temps réel**\n🔐 **Authentification multi-facteurs**\n\nVos données judiciaires sont protégées et confidentielles.",
    keywords: ["sécurité", "données", "protection", "confidentialité", "cryptage"],
    category: "technique"
  },
  
  // Audiences
  {
    question: "Comment consulter une audience ?",
    answer: "Plusieurs moyens de consulter les audiences :\n\n📺 **Affichage public** - Sans connexion, audiences du jour\n🔍 **Espace personnel** - Toutes vos audiences\n📱 **QR Code** - Scanner le code d'une audience\n\nL'affichage se rafraîchit automatiquement toutes les 30 secondes.",
    keywords: ["audience", "consulter", "voir", "horaire", "planning"],
    category: "audiences",
    links: [{ label: "Affichage public", url: "/affichage-public" }]
  },
  {
    question: "Comment créer une audience ?",
    answer: "La création d'audience suit ce processus :\n\n1️⃣ **Créer un dossier** avec les parties (justiciable, avocat)\n2️⃣ **Planifier l'audience** liée au dossier\n3️⃣ Les parties sont **automatiquement héritées**\n4️⃣ **Notifications** envoyées à tous les concernés\n\n⚠️ Seuls les greffiers peuvent créer des audiences.",
    keywords: ["créer", "audience", "nouvelle", "planifier", "programmer"],
    category: "audiences"
  },
  {
    question: "Que faire si mon audience est reportée ?",
    answer: "En cas de report d'audience :\n\n📧 Vous recevez une **notification automatique** (email/SMS)\n📅 La nouvelle date est visible dans votre espace\n📺 L'affichage public est mis à jour\n🔔 Configurez vos préférences de notification\n\nContactez le greffe pour plus de détails.",
    keywords: ["reportée", "annulée", "report", "notification", "changement"],
    category: "audiences"
  },
  {
    question: "Comment accéder à l'affichage public ?",
    answer: "L'affichage public est accessible :\n\n🖥️ Sur les écrans du tribunal\n🌐 Via le bouton 'Affichage public' du site\n📱 En scannant un QR code\n\n**Aucune connexion requise** - Idéal pour les justiciables.",
    keywords: ["affichage", "public", "écran", "tableau", "display"],
    category: "audiences",
    links: [{ label: "Voir l'affichage", url: "/affichage-public" }]
  },

  // Dossiers
  {
    question: "Comment créer un dossier ?",
    answer: "Pour créer un dossier judiciaire :\n\n1. Accédez à **Gestion des dossiers**\n2. Cliquez sur **Nouveau dossier**\n3. Renseignez :\n   • Numéro de dossier\n   • Justiciable (obligatoire)\n   • Avocat(s)\n   • Juge assigné\n4. Ajoutez les pièces jointes\n5. Validez la création",
    keywords: ["dossier", "créer", "nouveau", "affaire", "ouvrir"],
    category: "dossiers"
  },
  {
    question: "Comment ajouter des pièces à un dossier ?",
    answer: "Pour ajouter des pièces jointes :\n\n📎 Glissez-déposez vos fichiers\n📁 Formats acceptés : PDF, DOCX, Images\n📏 Taille max : 20 MB par fichier\n📊 Versioning automatique\n\nChaque ajout est tracé dans l'historique du dossier.",
    keywords: ["pièces", "documents", "ajouter", "fichiers", "upload"],
    category: "dossiers"
  },
  {
    question: "Qui peut voir mon dossier ?",
    answer: "L'accès aux dossiers est strictement contrôlé :\n\n✅ **Parties du dossier** (justiciable, avocat)\n✅ **Juge assigné**\n✅ **Greffier du tribunal**\n✅ **Procureur** (si affaire pénale)\n\n🔒 Personne d'autre ne peut consulter votre dossier.",
    keywords: ["accès", "voir", "dossier", "confidentialité", "qui"],
    category: "dossiers"
  },

  // Procédures
  {
    question: "Comment suivre une décision ?",
    answer: "Le suivi des décisions se fait via :\n\n⚖️ **Espace personnel** > Mes décisions\n🔔 **Notification** à la publication\n📄 **Téléchargement PDF** disponible\n📊 **Historique complet** des décisions\n\nLes décisions sont validées par le greffe avant publication.",
    keywords: ["décision", "jugement", "suivre", "verdict", "arrêt"],
    category: "procedures"
  },
  {
    question: "Comment recevoir des notifications ?",
    answer: "Configurez vos notifications dans :\n\n⚙️ **Paramètres** > **Préférences de notification**\n\n**Canaux disponibles :**\n📧 Email\n📱 SMS\n💬 WhatsApp\n\n**Types d'alertes :**\n• Audiences (création, report, rappel)\n• Dossiers (modification, pièces)\n• Décisions (rendue, publiée)",
    keywords: ["notifications", "alertes", "email", "sms", "whatsapp", "recevoir"],
    category: "technique"
  },
  {
    question: "Comment contacter le support ?",
    answer: "Notre équipe support est disponible :\n\n📞 **Téléphone** : +221 33 889 29 29\n📧 **Email** : contact@justice.sn\n🕐 **Horaires** : Lun-Ven, 8h-17h\n\nPour les urgences judiciaires, contactez directement le greffe de votre tribunal.",
    keywords: ["contact", "support", "aide", "assistance", "téléphone", "email"],
    category: "general"
  },
  {
    question: "Puis-je accéder à e-Justice sur mobile ?",
    answer: "Oui ! e-Justice est **100% responsive** :\n\n📱 Smartphone\n📲 Tablette\n💻 Ordinateur\n\nToutes les fonctionnalités sont accessibles sur tous les appareils. L'interface s'adapte automatiquement.",
    keywords: ["mobile", "smartphone", "tablette", "responsive", "application"],
    category: "technique"
  },
  {
    question: "Comment fonctionne le QR Code ?",
    answer: "Chaque audience possède un QR Code unique :\n\n📱 **Scannez** avec votre téléphone\n🔗 **Accédez** aux détails de l'audience\n📺 **Visible** sur l'affichage public\n📄 **Imprimable** sur les convocations\n\nLe QR Code permet un accès rapide sans authentification.",
    keywords: ["qr", "code", "scanner", "qrcode", "barcode"],
    category: "audiences"
  },
  {
    question: "Qu'est-ce qu'une convocation ?",
    answer: "Une convocation est un document officiel :\n\n📋 **Notification** de comparution\n📅 **Date et heure** de l'audience\n📍 **Lieu** (tribunal, salle)\n⚖️ **Objet** de l'affaire\n\nLes convocations sont envoyées automatiquement par email et SMS.",
    keywords: ["convocation", "citation", "comparution", "officiel"],
    category: "procedures"
  },
  {
    question: "Comment modifier mes informations ?",
    answer: "Pour modifier votre profil :\n\n1. Connectez-vous à votre compte\n2. Allez dans **Paramètres** > **Profil**\n3. Modifiez vos informations\n4. Enregistrez les changements\n\n⚠️ Certaines modifications nécessitent une validation administrative.",
    keywords: ["modifier", "profil", "informations", "compte", "changer"],
    category: "general"
  }
];

const quickCategories = [
  { id: "audiences", label: "Audiences", icon: Calendar },
  { id: "dossiers", label: "Dossiers", icon: FileText },
  { id: "procedures", label: "Procédures", icon: Scale },
  { id: "technique", label: "Technique", icon: HelpCircle }
];

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Bonjour ! 👋 Je suis **l'Assistant e-Justice**, votre guide du système judiciaire numérique sénégalais.\n\nComment puis-je vous aider aujourd'hui ?",
      sender: "bot",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const findBestMatch = (userMessage: string): FAQ | null => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Recherche exacte de question
    const exactMatch = faqs.find(faq => 
      faq.question.toLowerCase() === lowerMessage
    );
    if (exactMatch) return exactMatch;

    // Recherche par mots-clés avec scoring
    let bestMatch: FAQ | null = null;
    let maxScore = 0;

    faqs.forEach(faq => {
      let score = 0;
      
      // Score par mots-clés
      faq.keywords.forEach(keyword => {
        if (lowerMessage.includes(keyword)) {
          score += 2;
        }
      });
      
      // Bonus si la question contient des mots de la FAQ
      const faqWords = faq.question.toLowerCase().split(' ');
      faqWords.forEach(word => {
        if (word.length > 3 && lowerMessage.includes(word)) {
          score += 1;
        }
      });
      
      if (score > maxScore) {
        maxScore = score;
        bestMatch = faq;
      }
    });

    return maxScore >= 2 ? bestMatch : null;
  };

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText) return;

    // Ajouter le message utilisateur
    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: "user",
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);
    setActiveCategory(null);

    // Simuler un délai de réponse naturel
    const delay = 800 + Math.random() * 700;
    
    setTimeout(() => {
      const match = findBestMatch(messageText);
      
      let botResponse: string;
      let links: { label: string; url: string }[] | undefined;
      
      if (match) {
        botResponse = match.answer;
        links = match.links;
      } else {
        botResponse = "Je n'ai pas trouvé de réponse exacte à votre question. 🤔\n\n**Suggestions :**\n\n" +
          "• Reformulez votre question\n" +
          "• Utilisez les catégories ci-dessous\n" +
          "• Consultez les questions fréquentes\n\n" +
          "**Besoin d'aide humaine ?**\n📞 +221 33 889 29 29\n📧 contact@justice.sn";
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: "bot",
        timestamp: new Date(),
        links
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, delay);
  };

  const handleCategorySelect = (categoryId: string) => {
    setActiveCategory(categoryId === activeCategory ? null : categoryId);
  };

  const getCategoryQuestions = (categoryId: string) => {
    return faqs.filter(faq => faq.category === categoryId).slice(0, 4);
  };

  const handleReset = () => {
    setMessages([{
      id: "1",
      text: "Bonjour ! 👋 Je suis **l'Assistant e-Justice**, votre guide du système judiciaire numérique sénégalais.\n\nComment puis-je vous aider aujourd'hui ?",
      sender: "bot",
      timestamp: new Date()
    }]);
    setActiveCategory(null);
  };

  // Formatage du texte avec markdown simple
  const formatText = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <>
      {/* Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              size="lg"
              className="rounded-full w-16 h-16 shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 bg-gradient-to-br from-primary to-primary/80"
              onClick={() => setIsOpen(true)}
            >
              <MessageCircle className="w-7 h-7" />
            </Button>
            <motion.div
              className="absolute -top-1 -right-1"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Badge className="bg-green-500 text-white text-xs px-2">En ligne</Badge>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-[400px] h-[650px] bg-card rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary via-primary to-primary/90 text-primary-foreground p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                      <Scale className="w-7 h-7" />
                    </div>
                    <motion.div
                      className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-primary"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      Assistant e-Justice
                      <Sparkles className="w-4 h-4 text-accent" />
                    </h3>
                    <p className="text-xs opacity-90">Votre guide juridique 24/7</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-primary-foreground hover:bg-white/20 h-8 w-8"
                    onClick={handleReset}
                    title="Nouvelle conversation"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-primary-foreground hover:bg-white/20 h-8 w-8"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-2 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.sender === "bot" && (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Scale className="w-4 h-4 text-primary" />
                      </div>
                    )}
                    <div className="max-w-[80%] space-y-2">
                      <div
                        className={`rounded-2xl p-3 ${
                          message.sender === "user"
                            ? "bg-primary text-primary-foreground rounded-br-md"
                            : "bg-muted text-foreground rounded-bl-md"
                        }`}
                      >
                        <p 
                          className="text-sm leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: formatText(message.text) }}
                        />
                      </div>
                      {message.links && message.links.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {message.links.map((link, idx) => (
                            <a
                              key={idx}
                              href={link.url}
                              className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full hover:bg-primary/20 transition-colors"
                            >
                              {link.label}
                              <ChevronRight className="w-3 h-3" />
                            </a>
                          ))}
                        </div>
                      )}
                      <p className="text-[10px] text-muted-foreground">
                        {message.timestamp.toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </p>
                    </div>
                    {message.sender === "user" && (
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-primary-foreground" />
                      </div>
                    )}
                  </motion.div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-2"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Scale className="w-4 h-4 text-primary" />
                    </div>
                    <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                      <div className="flex gap-1.5">
                        <motion.div
                          className="w-2 h-2 bg-primary/50 rounded-full"
                          animate={{ y: [0, -6, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                        />
                        <motion.div
                          className="w-2 h-2 bg-primary/50 rounded-full"
                          animate={{ y: [0, -6, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
                        />
                        <motion.div
                          className="w-2 h-2 bg-primary/50 rounded-full"
                          animate={{ y: [0, -6, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Quick categories - shown at start */}
                {messages.length <= 2 && !isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-3 pt-2"
                  >
                    <p className="text-xs text-muted-foreground text-center font-medium">
                      Choisissez une catégorie ou posez votre question
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {quickCategories.map((cat) => {
                        const Icon = cat.icon;
                        return (
                          <Button
                            key={cat.id}
                            variant={activeCategory === cat.id ? "default" : "outline"}
                            size="sm"
                            className="h-auto py-3 flex flex-col items-center gap-1.5"
                            onClick={() => handleCategorySelect(cat.id)}
                          >
                            <Icon className="w-5 h-5" />
                            <span className="text-xs">{cat.label}</span>
                          </Button>
                        );
                      })}
                    </div>

                    {/* Show questions for selected category */}
                    <AnimatePresence>
                      {activeCategory && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-2 overflow-hidden"
                        >
                          {getCategoryQuestions(activeCategory).map((faq, idx) => (
                            <motion.button
                              key={idx}
                              initial={{ x: -10, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: idx * 0.1 }}
                              className="w-full text-left p-2.5 rounded-lg bg-muted/50 hover:bg-muted text-sm transition-colors flex items-center gap-2"
                              onClick={() => handleSend(faq.question)}
                            >
                              <ChevronRight className="w-4 h-4 text-primary flex-shrink-0" />
                              <span className="line-clamp-1">{faq.question}</span>
                            </motion.button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-border bg-background/50 backdrop-blur">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex gap-2"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Posez votre question juridique..."
                  className="flex-1 bg-muted/50"
                  disabled={isTyping}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim() || isTyping}
                  className="bg-primary hover:bg-primary/90 shrink-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
              <div className="flex items-center justify-center gap-4 mt-3 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  +221 33 889 29 29
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  contact@justice.sn
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
