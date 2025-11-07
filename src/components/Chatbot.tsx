import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

interface FAQ {
  question: string;
  answer: string;
  keywords: string[];
}

const faqs: FAQ[] = [
  {
    question: "Comment créer un compte ?",
    answer: "Pour créer un compte, cliquez sur le bouton 'Se connecter' en haut à droite, puis sélectionnez 'Créer un compte'. Remplissez le formulaire avec vos informations et suivez les instructions.",
    keywords: ["compte", "inscription", "créer", "nouveau"]
  },
  {
    question: "Qui peut utiliser e-Justice ?",
    answer: "e-Justice est accessible aux juges, greffiers, avocats, procureurs, justiciables et administrateurs du système judiciaire sénégalais. Chaque rôle dispose de fonctionnalités adaptées.",
    keywords: ["utilisateurs", "rôles", "accès", "qui"]
  },
  {
    question: "Comment consulter une audience ?",
    answer: "Vous pouvez consulter les audiences via l'affichage public (sans connexion) ou via votre espace personnel après connexion. L'affichage public montre les audiences du jour en temps réel.",
    keywords: ["audience", "consulter", "voir", "horaire"]
  },
  {
    question: "Où trouver les actualités ?",
    answer: "Toutes les actualités et mises à jour de la plateforme sont disponibles dans notre section Blog/Actualités. Vous y trouverez les dernières nouvelles du système judiciaire sénégalais.",
    keywords: ["actualités", "blog", "nouvelles", "informations"]
  },
  {
    question: "Que faire en cas d'audience reportée ?",
    answer: "Les audiences reportées sont automatiquement notifiées par email et SMS aux parties concernées. Vous pouvez consulter le nouveau planning dans votre espace ou sur l'affichage public.",
    keywords: ["reportée", "annulée", "report", "notification"]
  },
  {
    question: "Comment accéder à l'affichage public ?",
    answer: "Cliquez sur le bouton 'Affichage public' dans le menu principal. L'affichage public ne nécessite pas de connexion et montre les audiences en temps réel.",
    keywords: ["affichage", "public", "écran", "tableau"]
  },
  {
    question: "Quels tribunaux sont connectés ?",
    answer: "Plus de 45 tribunaux sénégalais sont connectés à e-Justice, couvrant les principales villes du pays : Dakar, Thiès, Saint-Louis, Ziguinchor, et bien d'autres.",
    keywords: ["tribunaux", "connectés", "nombre", "villes"]
  },
  {
    question: "Comment contacter le support ?",
    answer: "Vous pouvez nous contacter par téléphone au +221 33 889 29 29 ou par email à contact@justice.sn. Notre équipe est disponible du lundi au vendredi de 8h à 17h.",
    keywords: ["contact", "support", "aide", "assistance", "téléphone", "email"]
  },
  {
    question: "Les données sont-elles sécurisées ?",
    answer: "Oui, e-Justice utilise un cryptage de niveau bancaire et respecte toutes les normes de sécurité internationales. Vos données sont protégées et confidentielles.",
    keywords: ["sécurité", "données", "protection", "confidentialité"]
  },
  {
    question: "Comment recevoir des notifications ?",
    answer: "Les notifications sont envoyées automatiquement par email et SMS pour les changements d'audiences, nouveaux documents et décisions. Vous pouvez gérer vos préférences dans votre espace personnel.",
    keywords: ["notifications", "alertes", "email", "sms"]
  },
  {
    question: "Puis-je accéder à e-Justice sur mobile ?",
    answer: "Oui, e-Justice est entièrement responsive et accessible depuis n'importe quel appareil : ordinateur, tablette ou smartphone.",
    keywords: ["mobile", "smartphone", "tablette", "responsive"]
  }
];

const quickQuestions = [
  "Comment créer un compte ?",
  "Qui peut utiliser e-Justice ?",
  "Comment consulter une audience ?",
  "Où trouver les actualités ?"
];

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Bonjour ! 👋 Je suis l'assistant virtuel e-Justice. Comment puis-je vous aider aujourd'hui ?",
      sender: "bot",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
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

    // Recherche par mots-clés
    let bestMatch: FAQ | null = null;
    let maxScore = 0;

    faqs.forEach(faq => {
      let score = 0;
      faq.keywords.forEach(keyword => {
        if (lowerMessage.includes(keyword)) {
          score += 1;
        }
      });
      
      if (score > maxScore) {
        maxScore = score;
        bestMatch = faq;
      }
    });

    return maxScore > 0 ? bestMatch : null;
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

    // Simuler un délai de réponse
    setTimeout(() => {
      const match = findBestMatch(messageText);
      
      let botResponse: string;
      if (match) {
        botResponse = match.answer;
      } else {
        botResponse = "Je n'ai pas trouvé de réponse exacte à votre question. Voici quelques suggestions :\n\n" +
          quickQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n") +
          "\n\nPour plus d'assistance, contactez-nous au +221 33 889 29 29 ou à contact@justice.sn";
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: "bot",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleQuickQuestion = (question: string) => {
    handleSend(question);
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
              className="rounded-full w-16 h-16 shadow-gold hover:shadow-gold hover:scale-110 transition-smooth bg-gradient-to-br from-accent to-accent/80"
              onClick={() => setIsOpen(true)}
            >
              <MessageCircle className="w-6 h-6" />
            </Button>
            <motion.div
              className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
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
            className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-card rounded-2xl shadow-elegant border border-border overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                    <Bot className="w-6 h-6 text-accent-foreground" />
                  </div>
                  <motion.div
                    className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-primary"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
                <div>
                  <h3 className="font-bold flex items-center gap-2">
                    Assistant e-Justice
                    <Sparkles className="w-4 h-4" />
                  </h3>
                  <p className="text-xs opacity-90">En ligne</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-primary-foreground hover:bg-white/20"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
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
                      <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                        <Bot className="w-5 h-5 text-accent-foreground" />
                      </div>
                    )}
                    <div
                      className={`max-w-[75%] rounded-2xl p-3 ${
                        message.sender === "user"
                          ? "bg-accent text-accent-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-line">{message.text}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </p>
                    </div>
                    {message.sender === "user" && (
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-primary-foreground" />
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
                    <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                      <Bot className="w-5 h-5 text-accent-foreground" />
                    </div>
                    <div className="bg-muted rounded-2xl p-3">
                      <div className="flex gap-1">
                        <motion.div
                          className="w-2 h-2 bg-foreground/50 rounded-full"
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                        />
                        <motion.div
                          className="w-2 h-2 bg-foreground/50 rounded-full"
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                        />
                        <motion.div
                          className="w-2 h-2 bg-foreground/50 rounded-full"
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Quick questions */}
                {messages.length === 1 && !isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-2"
                  >
                    <p className="text-xs text-muted-foreground text-center">Questions fréquentes :</p>
                    <div className="flex flex-wrap gap-2">
                      {quickQuestions.map((question, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="cursor-pointer hover:bg-accent hover:text-accent-foreground transition-smooth"
                          onClick={() => handleQuickQuestion(question)}
                        >
                          {question}
                        </Badge>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-border">
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
                  placeholder="Posez votre question..."
                  className="flex-1"
                  disabled={isTyping}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim() || isTyping}
                  className="bg-accent hover:bg-accent/90"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Propulsé par e-Justice IA
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
