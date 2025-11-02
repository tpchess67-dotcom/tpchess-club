import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import EloChart from '@/components/EloChart';
import { 
  Home, 
  Users, 
  Trophy, 
  User, 
  LogOut,
  ArrowLeft,
  Save
} from "lucide-react";

interface Profile {
  username: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
}

interface ClubMember {
  elo_rating: number;
  joined_at: string;
}

const ClubProfile = () => {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [clubMember, setClubMember] = useState<ClubMember | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchClubMembership();
    } else {
      navigate("/auth");
    }
  }, [user, clubId]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      
      setProfile(data);
      setFirstName(data.first_name || "");
      setLastName(data.last_name || "");
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClubMembership = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("club_members")
        .select("elo_rating, joined_at")
        .eq("club_id", clubId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      setClubMember(data);
    } catch (error) {
      console.error("Error fetching club membership:", error);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: firstName,
          last_name: lastName,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été enregistrées",
      });

      fetchProfile();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour le profil",
      });
    }
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Chargement...</p>
      </div>
    );
  }

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
            <Button variant="outline" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </Button>
          </div>
          <h1 className="text-3xl font-bold">Mon Profil</h1>
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
            <Button variant="ghost" onClick={() => navigate(`/club/${clubId}/tournaments`)}>
              <Trophy className="w-4 h-4 mr-2" />
              Tournois
            </Button>
            <Button variant="ghost" onClick={() => navigate(`/club/${clubId}/members`)}>
              <Users className="w-4 h-4 mr-2" />
              Membres
            </Button>
            <Button variant="default">
              <User className="w-4 h-4 mr-2" />
              Mon Profil
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {clubMember && (
            <Card>
              <CardHeader>
                <CardTitle>Statistiques du club</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center p-4 rounded-lg bg-muted">
                    <p className="text-4xl font-bold text-primary">
                      {clubMember.elo_rating}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Classement ELO
                    </p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted">
                    <p className="text-4xl font-bold text-primary">
                      {new Date(clubMember.joined_at).toLocaleDateString("fr-FR")}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Membre depuis
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Informations personnelles</CardTitle>
              <CardDescription>
                Nom d'utilisateur : {profile.username} (non modifiable)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="first-name">Prénom</Label>
                <Input
                  id="first-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Votre prénom"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last-name">Nom</Label>
                <Input
                  id="last-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Votre nom"
                />
              </div>
              <Button onClick={handleUpdateProfile}>
                <Save className="w-4 h-4 mr-2" />
                Enregistrer
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Historique des parties</CardTitle>
              <CardDescription>
                Cette fonctionnalité sera bientôt disponible
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                L'historique de vos parties sera affiché ici
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ClubProfile;
