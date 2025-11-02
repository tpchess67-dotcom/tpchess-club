import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Home, 
  Users, 
  Trophy, 
  User, 
  LogOut,
  ArrowLeft,
  Plus,
  Calendar
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Tournament {
  id: string;
  name: string;
  description: string;
  start_date: string;
  status: string;
  current_round: number;
  created_at: string;
}

const ClubTournaments = () => {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const { user, signOut, isAdmin } = useAuth();
  
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (clubId) {
      fetchTournaments();
    fetchCompleted();
    }
  }, [clubId]);

  const fetchTournaments = async () => {
    try {
      const { data, error } = await supabase
        .from("tournaments")
        .select("*")
        .eq("club_id", clubId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTournaments(data || []);
    } catch (error) {
      console.error("Error fetching tournaments:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      upcoming: "default",
      ongoing: "secondary",
      completed: "outline",
    };
    
    const labels: Record<string, string> = {
      upcoming: "À venir",
      ongoing: "En cours",
      completed: "Terminé",
    };

    return (
      <Badge variant={variants[status] || "default"}>
        {labels[status] || status}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={() => navigate(`/club/${clubId}`)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
            {user && (
              <Button variant="outline" onClick={signOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Déconnexion
              </Button>
            )}
          </div>
          <h1 className="text-3xl font-bold">Tournois</h1>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b bg-card">
        <div className="container mx-auto px-4">
          <div className="flex gap-4 overflow-x-auto">
            <Button variant="ghost" onClick={() => navigate(`/club/${clubId}`)}>
              <Home className="w-4 h-4 mr-2" />
              Accueil
            </Button>
            <Button variant="default">
              <Trophy className="w-4 h-4 mr-2" />
              Tournois
            </Button>
            <Button variant="ghost" onClick={() => navigate(`/club/${clubId}/members`)}>
              <Users className="w-4 h-4 mr-2" />
              Membres
            </Button>
            {user && (
              <Button variant="ghost" onClick={() => navigate(`/club/${clubId}/profile`)}>
                <User className="w-4 h-4 mr-2" />
                Mon Profil
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {isAdmin && (
            <div className="flex justify-end">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Créer un tournoi
              </Button>
            </div>
          )}

          {loading ? (
            <p className="text-center py-8 text-muted-foreground">
              Chargement...
            </p>
          ) : tournaments.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Aucun tournoi pour le moment
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {tournaments.map((tournament) => (
                <Card key={tournament.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl">{tournament.name}</CardTitle>
                        <CardDescription className="mt-2">
                          {tournament.description}
                        </CardDescription>
                      </div>
                      {getStatusBadge(tournament.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      {tournament.start_date && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {format(new Date(tournament.start_date), "PPP", { locale: fr })}
                          </span>
                        </div>
                      )}
                      {tournament.status === "ongoing" && (
                        <div>
                          <span className="font-semibold">
                            Ronde {tournament.current_round}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="mt-4">
                      <Button variant="outline">
                        Voir les détails
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ClubTournaments;
