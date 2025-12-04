import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Calendar, MapPin, User, Clock, AlertCircle, CheckCircle, FileSearch, Download, Eye, Gavel, Scale, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApp } from "@/contexts/AppContext";
import DashboardLayout from "@/components/DashboardLayout";

const JusticiableMonDossier = () => {
  const { dossiers, audiences, currentUser, users } = useApp();
  const [activeTab, setActiveTab] = useState("dossier");

  // Dossiers où le justiciable est impliqué
  const mesDossiers = dossiers.filter(d => 
    d.accessList.includes(currentUser?.id || "")
  );

  // Audiences liées aux dossiers du justiciable
  const mesAudiences = audiences.filter(a => 
    a.justiciableId === currentUser?.id ||
    mesDossiers.some(d => d.audienceId === a.id)
  );

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; className: string }> = {
      "prevue": { variant: "default", className: "bg-blue-500" },
      "en_cours": { variant: "default", className: "bg-green-500" },
      "reportee": { variant: "destructive", className: "" },
      "terminee": { variant: "secondary", className: "" },
      "ouvert": { variant: "outline", className: "" },
      "clos": { variant: "secondary", className: "" },
      "archive": { variant: "outline", className: "" }
    };
    const labels: Record<string, string> = {
      "prevue": "Prévue",
      "en_cours": "En cours",
      "reportee": "Reportée",
      "terminee": "Terminée",
      "ouvert": "Ouvert",
      "clos": "Clôturé",
      "archive": "Archivé"
    };
    const style = styles[status] || { variant: "outline" as const, className: "" };
    return <Badge variant={style.variant} className={style.className}>{labels[status] || status}</Badge>;
  };

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.nom || "Non assigné";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-primary">Mon Dossier</h1>
            <p className="text-muted-foreground mt-1">Consultez les détails de votre affaire judiciaire</p>
          </div>
        </motion.div>

        {/* Info QR Code */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="shadow-elegant border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <FileSearch className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-semibold text-primary">Accès rapide par QR Code</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Vous pouvez accéder à votre dossier en scannant le QR code affiché sur le tableau numérique du tribunal ou celui reçu par SMS.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {mesDossiers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="shadow-elegant">
              <CardContent className="py-12 text-center">
                <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold">Aucun dossier trouvé</h3>
                <p className="text-muted-foreground mt-2">
                  Vous n'avez actuellement aucune affaire en cours. Scannez le QR code reçu pour accéder à votre dossier.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="dossier">
                <FileText className="w-4 h-4 mr-2" />
                Mon Dossier
              </TabsTrigger>
              <TabsTrigger value="audiences">
                <Calendar className="w-4 h-4 mr-2" />
                Mes Audiences
              </TabsTrigger>
              <TabsTrigger value="documents">
                <FileSearch className="w-4 h-4 mr-2" />
                Documents
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dossier" className="space-y-4">
              {mesDossiers.map((dossier, index) => (
                <motion.div
                  key={dossier.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="shadow-elegant">
                    <CardHeader className="border-b bg-muted/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Scale className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{dossier.numero}</CardTitle>
                            <p className="text-sm text-muted-foreground">{dossier.titre}</p>
                          </div>
                        </div>
                        {getStatusBadge(dossier.statut)}
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h4 className="font-semibold flex items-center gap-2">
                            <FileText className="w-4 h-4 text-primary" />
                            Informations du dossier
                          </h4>
                          <div className="space-y-2 pl-6">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Numéro:</span>
                              <span className="font-medium">{dossier.numero}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Titre:</span>
                              <span className="font-medium">{dossier.titre}</span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <h4 className="font-semibold flex items-center gap-2">
                            <Clock className="w-4 h-4 text-primary" />
                            Dates
                          </h4>
                          <div className="space-y-2 pl-6">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Création:</span>
                              <span className="font-medium">{new Date(dossier.dateCreation).toLocaleDateString('fr-FR')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Documents:</span>
                              <span className="font-medium">{dossier.pieces.length} pièce(s)</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      {dossier.description && (
                        <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                          <h4 className="font-semibold mb-2">Résumé de l'affaire</h4>
                          <p className="text-sm text-muted-foreground">{dossier.description}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </TabsContent>

            <TabsContent value="audiences" className="space-y-4">
              {mesAudiences.length === 0 ? (
                <Card className="shadow-elegant">
                  <CardContent className="py-12 text-center">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Aucune audience programmée pour le moment</p>
                  </CardContent>
                </Card>
              ) : (
                mesAudiences.map((audience, index) => (
                  <motion.div
                    key={audience.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="shadow-elegant hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="p-3 rounded-lg bg-primary/10">
                              <Calendar className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{audience.numero}</h3>
                              <p className="text-muted-foreground">{audience.parties}</p>
                              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4 text-primary" />
                                  {new Date(audience.date).toLocaleDateString('fr-FR', { 
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                  })}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4 text-primary" />
                                  {audience.heure}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4 text-primary" />
                                  {audience.salle}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {getStatusBadge(audience.statut)}
                            <span className="text-sm text-muted-foreground">
                              Juge: {getUserName(audience.jugeId)}
                            </span>
                          </div>
                        </div>
                        {audience.statut === "reportee" && (
                          <div className="mt-4 p-3 bg-destructive/10 rounded-lg flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
                            <div>
                              <p className="font-medium text-destructive">Audience reportée</p>
                              <p className="text-sm text-muted-foreground">
                                Vous serez notifié de la nouvelle date par SMS et email.
                              </p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
              {mesDossiers.flatMap(d => d.pieces).length === 0 ? (
                <Card className="shadow-elegant">
                  <CardContent className="py-12 text-center">
                    <FileSearch className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Aucun document disponible dans votre dossier</p>
                  </CardContent>
                </Card>
              ) : (
                mesDossiers.map(dossier => (
                  <Card key={dossier.id} className="shadow-elegant">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        Documents - {dossier.numero}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {dossier.pieces.map((piece, index) => (
                          <motion.div
                            key={piece.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center justify-between p-4 rounded-lg border bg-card hover:shadow-md transition-all"
                          >
                            <div className="flex items-center gap-4">
                              <div className="p-2 rounded-lg bg-primary/10">
                                <FileText className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">{piece.nom}</p>
                                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                  <Badge variant="outline" className="text-xs">{piece.type}</Badge>
                                  <span>{new Date(piece.dateAjout).toLocaleDateString('fr-FR')}</span>
                                  <span>{piece.taille}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="icon">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
};

export default JusticiableMonDossier;
