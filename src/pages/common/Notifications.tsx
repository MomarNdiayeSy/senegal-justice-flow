import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, Clock, Calendar, FileText, AlertCircle, Filter, Users, CheckCircle, XCircle, Send, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import DashboardLayout from "@/components/DashboardLayout";
import { useApp } from "@/contexts/AppContext";

interface NotificationExtended {
  id: string;
  type: string;
  titre: string;
  message: string;
  destinataireId: string;
  date: string;
  lue: boolean;
  statut: "envoye" | "echoue" | "en_attente";
}

const Notifications = () => {
  const { notifications, markNotificationAsRead, currentUser, users } = useApp();
  const [typeFilter, setTypeFilter] = useState<string>("tous");
  const [statusFilter, setStatusFilter] = useState<string>("tous");
  const [roleFilter, setRoleFilter] = useState<string>("tous");

  // Transform notifications with status
  const notificationsWithStatus: NotificationExtended[] = notifications.map(n => ({
    ...n,
    statut: Math.random() > 0.1 ? "envoye" : Math.random() > 0.5 ? "en_attente" : "echoue"
  } as NotificationExtended));

  const filteredNotifications = notificationsWithStatus.filter(n => {
    const matchesType = typeFilter === "tous" || n.type === typeFilter;
    const matchesStatus = statusFilter === "tous" || n.statut === statusFilter;
    const user = users.find(u => u.id === n.destinataireId);
    const matchesRole = roleFilter === "tous" || user?.role === roleFilter;
    return matchesType && matchesStatus && matchesRole;
  });

  const stats = [
    { 
      label: "Total envoyés", 
      value: notificationsWithStatus.filter(n => n.statut === "envoye").length, 
      color: "text-green-600",
      bgColor: "bg-green-100",
      icon: CheckCircle
    },
    { 
      label: "En attente", 
      value: notificationsWithStatus.filter(n => n.statut === "en_attente").length, 
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      icon: Clock
    },
    { 
      label: "Échecs", 
      value: notificationsWithStatus.filter(n => n.statut === "echoue").length, 
      color: "text-red-600",
      bgColor: "bg-red-100",
      icon: XCircle
    },
    { 
      label: "Non lus", 
      value: notificationsWithStatus.filter(n => !n.lue).length, 
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      icon: Bell
    }
  ];

  const getIcon = (type: string) => {
    const iconMap: Record<string, any> = {
      audience_creee: Calendar,
      audience_reportee: Clock,
      audience_annulee: AlertCircle,
      dossier_modifie: FileText,
    };
    return iconMap[type] || Bell;
  };

  const getTypeColor = (type: string) => {
    const colorMap: Record<string, string> = {
      audience_creee: "bg-blue-500",
      audience_reportee: "bg-amber-500",
      audience_annulee: "bg-red-500",
      dossier_modifie: "bg-purple-500",
    };
    return colorMap[type] || "bg-gray-500";
  };

  const getStatusBadge = (statut: "envoye" | "echoue" | "en_attente") => {
    const statusMap = {
      envoye: { label: "✓ Envoyé", className: "bg-green-500 hover:bg-green-600" },
      echoue: { label: "✗ Échoué", className: "bg-red-500 hover:bg-red-600" },
      en_attente: { label: "⏳ En attente", className: "bg-orange-500 hover:bg-orange-600" }
    };
    const status = statusMap[statut];
    return <Badge className={`${status.className} text-white`}>{status.label}</Badge>;
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      audience_creee: "Audience créée",
      audience_reportee: "Audience reportée",
      audience_annulee: "Audience annulée",
      dossier_modifie: "Dossier modifié",
    };
    return labels[type] || "Notification";
  };

  const handleMarkAsRead = (id: string) => {
    markNotificationAsRead(id);
  };

  const handleMarkAllAsRead = () => {
    filteredNotifications.filter(n => !n.lue).forEach(n => markNotificationAsRead(n.id));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="gradient-card border-0 shadow-md hover:shadow-lg transition-smooth">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                      <p className={`text-4xl font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Card className="shadow-md border-0">
          <CardHeader>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
                  >
                    <Bell className="w-7 h-7 text-primary" />
                  </motion.div>
                  <div>
                    <CardTitle className="text-2xl">Centre de notifications</CardTitle>
                    <CardDescription>Gestion et suivi des notifications envoyées</CardDescription>
                  </div>
                </div>
                {filteredNotifications.filter(n => !n.lue).length > 0 && (
                  <Button variant="outline" onClick={handleMarkAllAsRead}>
                    <Check className="w-4 h-4 mr-2" />
                    Tout marquer comme lu
                  </Button>
                )}
              </div>

              <Separator />

              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-3">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tous">Tous les types</SelectItem>
                    <SelectItem value="audience_creee">📅 Audience créée</SelectItem>
                    <SelectItem value="audience_reportee">⏰ Audience reportée</SelectItem>
                    <SelectItem value="audience_annulee">❌ Audience annulée</SelectItem>
                    <SelectItem value="dossier_modifie">📝 Dossier modifié</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tous">Tous les statuts</SelectItem>
                    <SelectItem value="envoye">✓ Envoyé</SelectItem>
                    <SelectItem value="en_attente">⏳ En attente</SelectItem>
                    <SelectItem value="echoue">✗ Échoué</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tous">Tous les rôles</SelectItem>
                    <SelectItem value="juge">⚖️ Juge</SelectItem>
                    <SelectItem value="avocat">👔 Avocat</SelectItem>
                    <SelectItem value="greffier">📋 Greffier</SelectItem>
                    <SelectItem value="justiciable">👤 Justiciable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Timeline */}
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border" />

              <div className="space-y-6">
                <AnimatePresence>
                  {filteredNotifications.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-12"
                    >
                      <Bell className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-lg text-muted-foreground">Aucune notification trouvée</p>
                    </motion.div>
                  ) : (
                    filteredNotifications.map((notification, index) => {
                      const Icon = getIcon(notification.type);
                      const user = users.find(u => u.id === notification.destinataireId);
                      
                      return (
                        <motion.div
                          key={notification.id}
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          exit={{ x: 20, opacity: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="relative pl-20"
                        >
                          {/* Timeline dot */}
                          <motion.div
                            className={`absolute left-6 -translate-x-1/2 p-3 rounded-full ${getTypeColor(notification.type)} text-white shadow-lg z-10`}
                            whileHover={{ scale: 1.1 }}
                          >
                            <Icon className="w-5 h-5" />
                          </motion.div>

                          <Card
                            className={`hover:shadow-lg transition-smooth ${
                              !notification.lue ? "border-l-4 border-l-accent bg-accent/5" : ""
                            }`}
                          >
                            <CardContent className="p-6">
                              <div className="space-y-3">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-2">
                                      <h3 className="font-bold text-lg">{notification.titre}</h3>
                                      {!notification.lue && (
                                        <Badge className="bg-primary hover:bg-primary text-white">
                                          Nouveau
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-muted-foreground mb-2">{notification.message}</p>
                                  </div>
                                  {!notification.lue && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleMarkAsRead(notification.id)}
                                      className="shrink-0"
                                    >
                                      <Check className="w-4 h-4 mr-1" />
                                      Marquer lu
                                    </Button>
                                  )}
                                </div>

                                <div className="flex flex-wrap items-center gap-3 text-sm">
                                  {getStatusBadge(notification.statut)}
                                  <Badge variant="outline">{getTypeLabel(notification.type)}</Badge>
                                  {user && (
                                    <Badge variant="secondary" className="gap-1">
                                      <Users className="w-3 h-3" />
                                      {user.prenom} {user.nom} ({user.role})
                                    </Badge>
                                  )}
                                </div>

                                <Separator />

                                <p className="text-xs text-muted-foreground flex items-center gap-2">
                                  <Clock className="w-3 h-3" />
                                  {new Date(notification.date).toLocaleString("fr-FR", {
                                    day: "2-digit",
                                    month: "long",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit"
                                  })}
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })
                  )}
                </AnimatePresence>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Notifications;
