import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, ChevronRight, Users } from "lucide-react";
import chessLogo from "@/assets/chess-logo.png";
import { useAuth } from "@/contexts/AuthContext";

interface Club {
  id: string;
  name: string;
  type: string;
  description: string;
  logo_url: string | null;
  color_primary: string;
  color_secondary: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    try {
      const { data, error } = await supabase
        .from("clubs")
        .select("*")
        .order("name");

      if (error) throw error;
      setClubs(data || []);
    } catch (error) {
      console.error("Error fetching clubs:", error);
    } finally {
      setLoading(false);
    }
  };

  const getClubIcon = (type: string) => {
    switch(type) {
      case 'echecs':
        return <Crown className="w-12 h-12" />;
      default:
        return <Users className="w-12 h-12" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={chessLogo} alt="TPCHESS" className="w-12 h-12" />
            <h1 className="text-2xl font-bold">TPCHESS</h1>
          </div>
          <div className="flex gap-2">
            {!user ? (
              <Button onClick={() => navigate("/auth")}>
                Se connecter
              </Button>
            ) : (
              <Button variant="outline" onClick={signOut}>
                Déconnexion
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold mb-2">Sélectionnez votre club</h2>
          <p className="text-muted-foreground">
            Choisissez le club auquel vous souhaitez accéder
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Chargement des clubs...</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            {clubs.map((club) => (
              <Card
                key={club.id}
                className="hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => navigate(`/club/${club.id}`)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div 
                      className="p-3 rounded-full"
                      style={{ backgroundColor: club.color_primary + '20' }}
                    >
                      {getClubIcon(club.type)}
                    </div>
                    <ChevronRight className="w-6 h-6 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </div>
                  <CardTitle className="text-xl">{club.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {club.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full"
                    style={{ 
                      backgroundColor: club.color_primary,
                      color: club.color_secondary
                    }}
                  >
                    Accéder au club
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
