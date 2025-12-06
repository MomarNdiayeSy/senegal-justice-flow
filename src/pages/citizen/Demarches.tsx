import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Compass,
  FileText,
  Users,
  Clock,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Scale,
  Building2,
  Gavel,
  Shield
} from "lucide-react";

const Demarches = () => {
  const navigate = useNavigate();

  const demarches = [
    {
      icon: FileText,
      title: "Déposer une plainte",
      description: "Comment déposer une plainte auprès des autorités compétentes",
      steps: [
        "Rassemblez les preuves et documents nécessaires",
        "Rendez-vous au commissariat le plus proche",
        "Présentez votre pièce d'identité",
        "Expliquez les faits de manière chronologique",
        "Signez le procès-verbal de plainte",
        "Conservez une copie du récépissé"
      ],
      duration: "1 à 2 heures",
      documents: ["Pièce d'identité", "Preuves des faits", "Témoignages écrits (optionnel)"]
    },
    {
      icon: Gavel,
      title: "Se constituer partie civile",
      description: "Rejoindre une procédure pénale en tant que victime",
      steps: [
        "Rédigez une lettre de constitution de partie civile",
        "Joignez les justificatifs de préjudice",
        "Adressez le dossier au tribunal compétent",
        "Attendez la convocation à l'audience",
        "Présentez-vous avec votre avocat (recommandé)"
      ],
      duration: "Variable selon la procédure",
      documents: ["Lettre de constitution", "Justificatifs de préjudice", "Pièce d'identité"]
    },
    {
      icon: Building2,
      title: "Saisir le tribunal civil",
      description: "Engager une action en justice civile",
      steps: [
        "Consultez un avocat pour évaluer votre dossier",
        "Préparez l'assignation avec les motifs de la demande",
        "Faites signifier l'assignation par un huissier",
        "Déposez l'original au greffe du tribunal",
        "Attendez la date d'audience"
      ],
      duration: "6 mois à 2 ans",
      documents: ["Assignation", "Preuves à l'appui", "Pièce d'identité", "Justificatifs"]
    },
    {
      icon: Users,
      title: "Demander l'aide juridictionnelle",
      description: "Bénéficier d'une prise en charge des frais de justice",
      steps: [
        "Vérifiez votre éligibilité (revenus, situation)",
        "Téléchargez le formulaire Cerfa",
        "Rassemblez les justificatifs de revenus",
        "Déposez le dossier au bureau d'aide juridictionnelle",
        "Attendez la décision (environ 1 mois)"
      ],
      duration: "1 mois environ",
      documents: ["Formulaire de demande", "Avis d'imposition", "Justificatifs de revenus", "Pièce d'identité"]
    },
    {
      icon: Scale,
      title: "Faire appel d'un jugement",
      description: "Contester une décision de justice",
      steps: [
        "Respectez le délai d'appel (généralement 1 mois)",
        "Rédigez la déclaration d'appel",
        "Déposez-la au greffe de la cour d'appel",
        "Préparez vos conclusions d'appel",
        "Présentez-vous à l'audience d'appel"
      ],
      duration: "1 à 2 ans",
      documents: ["Jugement contesté", "Déclaration d'appel", "Conclusions", "Nouvelles preuves"]
    },
    {
      icon: Shield,
      title: "Demander une ordonnance de protection",
      description: "Se protéger en cas de violences conjugales",
      steps: [
        "Déposez une requête auprès du juge aux affaires familiales",
        "Joignez les preuves des violences",
        "Le juge statue dans les 6 jours",
        "L'ordonnance peut interdire au conjoint de s'approcher",
        "La mesure est valable 6 mois renouvelables"
      ],
      duration: "6 jours maximum",
      documents: ["Requête", "Certificats médicaux", "Témoignages", "Dépôt de plainte (conseillé)"]
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-8"
      >
        <Button 
          variant="ghost" 
          onClick={() => navigate("/citizen/dashboard")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour au tableau de bord
        </Button>
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500">
            <Compass className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold">
              Guide des Démarches
            </h1>
            <p className="text-muted-foreground">
              Toutes les étapes pour vos procédures judiciaires
            </p>
          </div>
        </div>
      </motion.div>

      {/* Alert */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-8"
      >
        <Card className="p-4 bg-blue-500/10 border-blue-500/30">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
            <div>
              <p className="font-medium text-blue-700 dark:text-blue-400">Conseil</p>
              <p className="text-sm text-muted-foreground">
                Pour toute procédure complexe, nous vous recommandons de consulter un avocat ou de vous rendre 
                à une permanence juridique gratuite.
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Démarches List */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {demarches.map((demarche, index) => (
          <motion.div key={index} variants={itemVariants}>
            <Card className="p-6 hover:shadow-elegant transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10">
                  <demarche.icon className="w-8 h-8 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold mb-2">{demarche.title}</h2>
                  <p className="text-muted-foreground mb-4">{demarche.description}</p>

                  {/* Duration */}
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-4 h-4 text-accent" />
                    <span className="text-sm font-medium">Durée estimée: {demarche.duration}</span>
                  </div>

                  {/* Steps */}
                  <div className="mb-4">
                    <h3 className="font-medium mb-2">Étapes à suivre:</h3>
                    <div className="space-y-2">
                      {demarche.steps.map((step, stepIndex) => (
                        <div key={stepIndex} className="flex items-start gap-2">
                          <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-bold text-accent">{stepIndex + 1}</span>
                          </div>
                          <span className="text-sm">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Documents */}
                  <div className="bg-secondary/30 p-4 rounded-lg">
                    <h3 className="font-medium mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-accent" />
                      Documents requis:
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {demarche.documents.map((doc, docIndex) => (
                        <span 
                          key={docIndex} 
                          className="px-3 py-1 bg-background rounded-full text-sm border"
                        >
                          {doc}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8"
      >
        <Card className="p-6 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-0">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold mb-1">Besoin d'aide pour une démarche ?</h3>
              <p className="text-muted-foreground">
                Utilisez notre assistant pré-plainte pour préparer votre dossier.
              </p>
            </div>
            <Button onClick={() => navigate("/citizen/pre-plainte")}>
              Assistant Pré-Plainte
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Demarches;
