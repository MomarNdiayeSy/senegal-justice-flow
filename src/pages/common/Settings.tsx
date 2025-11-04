import { useState } from "react";
import { motion } from "framer-motion";
import { Settings as SettingsIcon, Bell, Shield, Globe, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DashboardLayout from "@/components/DashboardLayout";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    tribunal: "Tribunal de Dakar",
    timezone: "Africa/Dakar",
    language: "fr",
    notifications: {
      email: true,
      sms: true,
      whatsapp: false
    },
    security: {
      twoFactor: false,
      sessionTimeout: "30"
    },
    display: {
      autoRefresh: true,
      refreshInterval: "30"
    }
  });

  const handleSave = () => {
    toast({
      title: "Paramètres enregistrés",
      description: "Vos paramètres ont été mis à jour avec succès."
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-accent" />
          <h1 className="text-3xl font-bold">Paramètres système</h1>
        </div>

        {/* General Settings */}
        <Card className="shadow-md border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Paramètres généraux
            </CardTitle>
            <CardDescription>
              Configuration générale du système
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Tribunal principal</Label>
                <Input
                  value={settings.tribunal}
                  onChange={(e) => setSettings({ ...settings, tribunal: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Fuseau horaire</Label>
                <Select
                  value={settings.timezone}
                  onValueChange={(value) => setSettings({ ...settings, timezone: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Africa/Dakar">Dakar (GMT+0)</SelectItem>
                    <SelectItem value="Africa/Abidjan">Abidjan (GMT+0)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Langue</Label>
                <Select
                  value={settings.language}
                  onValueChange={(value) => setSettings({ ...settings, language: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="shadow-md border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Configurez vos préférences de notification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label>Notifications par email</Label>
                <p className="text-sm text-muted-foreground">
                  Recevoir les alertes par email
                </p>
              </div>
              <Switch
                checked={settings.notifications.email}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, email: checked }
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Notifications par SMS</Label>
                <p className="text-sm text-muted-foreground">
                  Recevoir les alertes par SMS
                </p>
              </div>
              <Switch
                checked={settings.notifications.sms}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, sms: checked }
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Notifications WhatsApp</Label>
                <p className="text-sm text-muted-foreground">
                  Recevoir les alertes via WhatsApp
                </p>
              </div>
              <Switch
                checked={settings.notifications.whatsapp}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, whatsapp: checked }
                  })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="shadow-md border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Sécurité
            </CardTitle>
            <CardDescription>
              Paramètres de sécurité et authentification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label>Authentification à deux facteurs</Label>
                <p className="text-sm text-muted-foreground">
                  Sécurisez votre compte avec 2FA
                </p>
              </div>
              <Switch
                checked={settings.security.twoFactor}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    security: { ...settings.security, twoFactor: checked }
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Délai d'expiration de session (minutes)</Label>
              <Input
                type="number"
                value={settings.security.sessionTimeout}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    security: { ...settings.security, sessionTimeout: e.target.value }
                  })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Display Settings */}
        <Card className="shadow-md border-0">
          <CardHeader>
            <CardTitle>Affichage public</CardTitle>
            <CardDescription>
              Configuration de l'écran d'affichage public
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label>Rafraîchissement automatique</Label>
                <p className="text-sm text-muted-foreground">
                  Actualiser l'affichage automatiquement
                </p>
              </div>
              <Switch
                checked={settings.display.autoRefresh}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    display: { ...settings.display, autoRefresh: checked }
                  })
                }
              />
            </div>
            {settings.display.autoRefresh && (
              <div className="space-y-2">
                <Label>Intervalle de rafraîchissement (secondes)</Label>
                <Input
                  type="number"
                  value={settings.display.refreshInterval}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      display: { ...settings.display, refreshInterval: e.target.value }
                    })
                  }
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Button onClick={handleSave} size="lg" className="w-full md:w-auto shadow-gold">
          <Save className="w-5 h-5 mr-2" />
          Enregistrer les paramètres
        </Button>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
