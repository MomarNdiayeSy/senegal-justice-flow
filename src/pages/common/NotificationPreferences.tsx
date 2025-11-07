import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bell, Mail, MessageSquare, Phone, Save, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import DashboardLayout from "@/components/DashboardLayout";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";

const NotificationPreferences = () => {
  const { currentUser, notificationPreferences, updateNotificationPreferences } = useApp();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const userPrefs = notificationPreferences.find(p => p.userId === currentUser?.id);

  const [preferences, setPreferences] = useState({
    canaux: {
      email: userPrefs?.canaux.email ?? true,
      sms: userPrefs?.canaux.sms ?? false,
      whatsapp: userPrefs?.canaux.whatsapp ?? false
    },
    types: {
      audience_creee: userPrefs?.types.audience_creee ?? true,
      audience_reportee: userPrefs?.types.audience_reportee ?? true,
      audience_annulee: userPrefs?.types.audience_annulee ?? true,
      dossier_cree: userPrefs?.types.dossier_cree ?? true,
      dossier_modifie: userPrefs?.types.dossier_modifie ?? true,
      dossier_clos: userPrefs?.types.dossier_clos ?? true,
      piece_ajoutee: userPrefs?.types.piece_ajoutee ?? true,
      decision_rendue: userPrefs?.types.decision_rendue ?? true,
      convocation_recue: userPrefs?.types.convocation_recue ?? true,
      echeance_proche: userPrefs?.types.echeance_proche ?? true,
      commentaire_ajoute: userPrefs?.types.commentaire_ajoute ?? false,
      assignation_nouveau_dossier: userPrefs?.types.assignation_nouveau_dossier ?? true
    }
  });

  useEffect(() => {
    if (userPrefs) {
      setPreferences({
        canaux: userPrefs.canaux,
        types: userPrefs.types
      });
    }
  }, [userPrefs]);

  const handleCanalToggle = (canal: keyof typeof preferences.canaux) => {
    setPreferences(prev => ({
      ...prev,
      canaux: {
        ...prev.canaux,
        [canal]: !prev.canaux[canal]
      }
    }));
  };

  const handleTypeToggle = (type: keyof typeof preferences.types) => {
    setPreferences(prev => ({
      ...prev,
      types: {
        ...prev.types,
        [type]: !prev.types[type]
      }
    }));
  };

  const handleSave = () => {
    if (!currentUser) return;

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      updateNotificationPreferences(currentUser.id, preferences);
      setLoading(false);
      
      toast({
        title: "Préférences enregistrées",
        description: "Vos préférences de notification ont été mises à jour avec succès.",
      });
    }, 500);
  };

  const canaux = [
    {
      id: "email",
      label: "Email",
      description: "Recevoir les notifications par email",
      icon: Mail,
      color: "text-blue-600"
    },
    {
      id: "sms",
      label: "SMS",
      description: "Recevoir les notifications par SMS",
      icon: Phone,
      color: "text-green-600"
    },
    {
      id: "whatsapp",
      label: "WhatsApp",
      description: "Recevoir les notifications sur WhatsApp",
      icon: MessageSquare,
      color: "text-emerald-600"
    }
  ];

  const typeCategories = [
    {
      category: "Audiences",
      types: [
        {
          id: "audience_creee",
          label: "Audiences créées",
          description: "Être notifié lors de la création d'une nouvelle audience"
        },
        {
          id: "audience_reportee",
          label: "Audiences reportées",
          description: "Être notifié lorsqu'une audience est reportée"
        },
        {
          id: "audience_annulee",
          label: "Audiences annulées",
          description: "Être notifié lorsqu'une audience est annulée"
        }
      ]
    },
    {
      category: "Dossiers",
      types: [
        {
          id: "dossier_cree",
          label: "Dossiers créés",
          description: "Être notifié lors de la création d'un nouveau dossier"
        },
        {
          id: "dossier_modifie",
          label: "Dossiers modifiés",
          description: "Être notifié lors de modifications sur les dossiers"
        },
        {
          id: "dossier_clos",
          label: "Dossiers clôturés",
          description: "Être notifié lorsqu'un dossier est clôturé"
        },
        {
          id: "piece_ajoutee",
          label: "Pièces ajoutées",
          description: "Être notifié lors de l'ajout d'une pièce à un dossier"
        },
        {
          id: "assignation_nouveau_dossier",
          label: "Assignation de dossiers",
          description: "Être notifié lors de l'assignation d'un nouveau dossier"
        }
      ]
    },
    {
      category: "Procédures",
      types: [
        {
          id: "decision_rendue",
          label: "Décisions rendues",
          description: "Être notifié lorsqu'une décision judiciaire est rendue"
        },
        {
          id: "convocation_recue",
          label: "Convocations",
          description: "Être notifié lors de la réception d'une convocation"
        },
        {
          id: "echeance_proche",
          label: "Échéances proches",
          description: "Être notifié lorsqu'une échéance de procédure approche"
        },
        {
          id: "commentaire_ajoute",
          label: "Commentaires ajoutés",
          description: "Être notifié lorsqu'un commentaire est ajouté sur un dossier"
        }
      ]
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <Card className="shadow-md border-0">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Bell className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Préférences de notification</CardTitle>
                  <CardDescription>
                    Configurez comment et quand vous souhaitez recevoir des notifications
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Canaux de notification */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Canaux de notification</h3>
                <div className="grid gap-4">
                  {canaux.map((canal) => {
                    const Icon = canal.icon;
                    return (
                      <Card key={canal.id} className="border-2">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`p-3 rounded-full bg-gray-100 ${canal.color}`}>
                                <Icon className="w-5 h-5" />
                              </div>
                              <div>
                                <Label htmlFor={canal.id} className="text-base font-medium cursor-pointer">
                                  {canal.label}
                                </Label>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {canal.description}
                                </p>
                              </div>
                            </div>
                            <Switch
                              id={canal.id}
                              checked={preferences.canaux[canal.id as keyof typeof preferences.canaux]}
                              onCheckedChange={() => handleCanalToggle(canal.id as keyof typeof preferences.canaux)}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              <Separator />

              {/* Types de notification */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Types de notification</h3>
                <div className="space-y-6">
                  {typeCategories.map((category) => (
                    <div key={category.category}>
                      <h4 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                        {category.category}
                      </h4>
                      <div className="grid gap-3">
                        {category.types.map((type) => (
                          <div key={type.id} className="flex items-center justify-between p-3 rounded-lg border">
                            <div className="flex-1">
                              <Label htmlFor={type.id} className="font-medium cursor-pointer">
                                {type.label}
                              </Label>
                              <p className="text-sm text-muted-foreground mt-1">
                                {type.description}
                              </p>
                            </div>
                            <Switch
                              id={type.id}
                              checked={preferences.types[type.id as keyof typeof preferences.types]}
                              onCheckedChange={() => handleTypeToggle(type.id as keyof typeof preferences.types)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={loading} size="lg" className="gap-2">
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Enregistrer les préférences
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <CheckCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">Notifications automatiques</p>
                  <p className="text-sm text-blue-700 mt-1">
                    Les notifications sont envoyées automatiquement lors de la création, modification ou report d'audiences.
                    Vous pouvez personnaliser vos préférences pour recevoir uniquement les notifications qui vous concernent.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default NotificationPreferences;
