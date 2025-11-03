import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Scale, Clock, Calendar as CalendarIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QRCodeSVG } from "qrcode.react";

interface Audience {
  numero: string;
  parties: string;
  heure: string;
  salle: string;
  statut: "prevue" | "en_cours" | "reportee" | "terminee";
}

const PublicDisplay = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [audiences] = useState<Audience[]>([
    {
      numero: "AUD-2025-001",
      parties: "Diallo vs Sarr",
      heure: "09:00",
      salle: "Salle 1",
      statut: "prevue"
    },
    {
      numero: "AUD-2025-002",
      parties: "État vs Fall",
      heure: "14:30",
      salle: "Salle 3",
      statut: "en_cours"
    },
    {
      numero: "AUD-2025-005",
      parties: "Wade vs Banque Nationale",
      heure: "11:00",
      salle: "Salle 2",
      statut: "prevue"
    },
    {
      numero: "AUD-2025-006",
      parties: "Kane succession",
      heure: "16:00",
      salle: "Salle 1",
      statut: "prevue"
    }
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getStatusBadge = (statut: Audience["statut"]) => {
    const variants = {
      prevue: { label: "Prévue", className: "bg-blue-500 text-white text-2xl px-6 py-2" },
      en_cours: { label: "En cours", className: "bg-amber-500 text-white text-2xl px-6 py-2 animate-pulse" },
      reportee: { label: "Reportée", className: "bg-purple-500 text-white text-2xl px-6 py-2" },
      terminee: { label: "Terminée", className: "bg-green-500 text-white text-2xl px-6 py-2" }
    };

    const variant = variants[statut];
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  return (
    <div className="min-h-screen gradient-hero text-primary-foreground p-8">
      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-12"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-6">
            <Scale className="w-20 h-20 text-accent" />
            <div>
              <h1 className="text-6xl font-bold">e-Justice Sénégal</h1>
              <p className="text-2xl opacity-90">Tribunal de Dakar</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-3 text-4xl font-bold">
              <Clock className="w-12 h-12 text-accent" />
              {currentTime.toLocaleTimeString('fr-FR')}
            </div>
            <div className="flex items-center gap-3 text-2xl mt-2">
              <CalendarIcon className="w-8 h-8 text-accent" />
              {currentTime.toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
            </div>
          </div>
        </div>

        <div className="h-2 bg-accent rounded-full" />
      </motion.div>

      {/* Title */}
      <motion.h2
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-5xl font-bold mb-8 text-center"
      >
        Audiences du jour
      </motion.h2>

      {/* Audiences Grid */}
      <div className="grid gap-6">
        {audiences.map((audience, index) => (
          <motion.div
            key={audience.numero}
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 * index }}
          >
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-elegant">
              <div className="p-8">
                <div className="flex items-center justify-between">
                  <div className="flex-1 grid grid-cols-5 gap-6 items-center">
                    {/* Numéro */}
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">N° Affaire</p>
                      <p className="text-2xl font-bold text-primary">{audience.numero}</p>
                    </div>

                    {/* Parties */}
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground mb-1">Parties</p>
                      <p className="text-2xl font-semibold text-foreground">{audience.parties}</p>
                    </div>

                    {/* Heure */}
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Heure</p>
                      <p className="text-3xl font-bold text-primary">{audience.heure}</p>
                    </div>

                    {/* Salle */}
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Salle</p>
                      <p className="text-2xl font-bold text-accent">{audience.salle}</p>
                    </div>
                  </div>

                  {/* Status & QR */}
                  <div className="flex items-center gap-8 ml-8">
                    {getStatusBadge(audience.statut)}
                    <div className="bg-white p-4 rounded-xl shadow-md">
                      <QRCodeSVG
                        value={`https://ejustice.sn/audience/${audience.numero}`}
                        size={120}
                        level="H"
                        includeMargin
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-12 text-center"
      >
        <div className="inline-flex items-center gap-4 bg-white/10 glass-effect rounded-full px-8 py-4">
          <div className="w-16 h-16 bg-white rounded-full p-2">
            <QRCodeSVG
              value="https://ejustice.sn"
              size={48}
              level="H"
            />
          </div>
          <div className="text-left">
            <p className="text-xl font-semibold">Scannez pour plus d'infos</p>
            <p className="text-sm opacity-80">Suivez vos audiences en ligne</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PublicDisplay;
