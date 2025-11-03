import { motion } from "framer-motion";
import { Bell, Check, Clock, Calendar, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/DashboardLayout";
import { useApp } from "@/contexts/AppContext";

const Notifications = () => {
  const { notifications, markNotificationAsRead, currentUser } = useApp();

  const userNotifications = notifications.filter(
    n => !currentUser || n.destinataireId === currentUser.id
  );

  const unreadCount = userNotifications.filter(n => !n.lue).length;

  const getIcon = (type: string) => {
    switch (type) {
      case "audience_creee":
        return <Calendar className="w-5 h-5" />;
      case "audience_reportee":
        return <Clock className="w-5 h-5" />;
      case "audience_annulee":
        return <AlertCircle className="w-5 h-5" />;
      case "dossier_modifie":
        return <FileText className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "audience_creee":
        return "bg-blue-500";
      case "audience_reportee":
        return "bg-amber-500";
      case "audience_annulee":
        return "bg-red-500";
      case "dossier_modifie":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  const handleMarkAsRead = (id: string) => {
    markNotificationAsRead(id);
  };

  const handleMarkAllAsRead = () => {
    userNotifications.filter(n => !n.lue).forEach(n => markNotificationAsRead(n.id));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Card className="shadow-md border-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <CardTitle className="text-2xl">Notifications</CardTitle>
                {unreadCount > 0 && (
                  <Badge className="bg-destructive hover:bg-destructive text-white">
                    {unreadCount} non lue{unreadCount > 1 ? "s" : ""}
                  </Badge>
                )}
              </div>
              {unreadCount > 0 && (
                <Button variant="outline" onClick={handleMarkAllAsRead}>
                  <Check className="w-4 h-4 mr-2" />
                  Tout marquer comme lu
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userNotifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg text-muted-foreground">
                    Aucune notification
                  </p>
                </div>
              ) : (
                userNotifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card
                      className={`hover:shadow-md transition-smooth ${
                        !notification.lue ? "border-l-4 border-l-accent bg-accent/5" : ""
                      }`}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-full ${getTypeColor(notification.type)} text-white`}>
                            {getIcon(notification.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-bold text-lg">{notification.titre}</h3>
                              {!notification.lue && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleMarkAsRead(notification.id)}
                                >
                                  <Check className="w-4 h-4 mr-1" />
                                  Marquer comme lu
                                </Button>
                              )}
                            </div>
                            <p className="text-muted-foreground mb-3">{notification.message}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(notification.date).toLocaleString("fr-FR", {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Notifications;
