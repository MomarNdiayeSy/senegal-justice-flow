import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Activity, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/DashboardLayout";

const Stats = () => {
  const metrics = [
    {
      title: "Audiences ce mois",
      value: "234",
      change: "+12.5%",
      trend: "up",
      icon: Activity
    },
    {
      title: "Taux de reports",
      value: "8.3%",
      change: "-2.1%",
      trend: "down",
      icon: TrendingDown
    },
    {
      title: "Durée moyenne",
      value: "45min",
      change: "-5min",
      trend: "down",
      icon: TrendingUp
    },
    {
      title: "Utilisateurs actifs",
      value: "156",
      change: "+23",
      trend: "up",
      icon: Users
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold mb-2">Statistiques et analyses</h2>
          <p className="text-muted-foreground">
            Vue d'ensemble des performances du système judiciaire
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, index) => (
            <motion.div
              key={index}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="gradient-card border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <metric.icon className="w-8 h-8 text-accent" />
                    <span
                      className={`text-sm font-semibold ${
                        metric.trend === "up" ? "text-success" : "text-destructive"
                      }`}
                    >
                      {metric.change}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{metric.title}</p>
                    <p className="text-3xl font-bold">{metric.value}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-md border-0">
            <CardHeader>
              <CardTitle>Évolution des audiences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-secondary/30 rounded-lg">
                <p className="text-muted-foreground">Graphique à venir</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md border-0">
            <CardHeader>
              <CardTitle>Répartition par statut</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-secondary/30 rounded-lg">
                <p className="text-muted-foreground">Graphique à venir</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance by Court */}
        <Card className="shadow-md border-0">
          <CardHeader>
            <CardTitle>Performance par tribunal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Tribunal de Dakar", audiences: 145, efficiency: 92 },
                { name: "Tribunal de Thiès", audiences: 98, efficiency: 88 },
                { name: "Tribunal de Saint-Louis", audiences: 76, efficiency: 85 },
                { name: "Tribunal de Ziguinchor", audiences: 54, efficiency: 90 }
              ].map((tribunal, index) => (
                <motion.div
                  key={index}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{tribunal.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {tribunal.audiences} audiences
                      </span>
                    </div>
                    <div className="h-3 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${tribunal.efficiency}%` }}
                        transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                        className="h-full bg-accent"
                      />
                    </div>
                  </div>
                  <span className="text-lg font-bold text-accent min-w-[60px] text-right">
                    {tribunal.efficiency}%
                  </span>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Stats;
