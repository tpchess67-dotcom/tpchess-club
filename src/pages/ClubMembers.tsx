import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  Home, 
  Users, 
  Trophy, 
  User, 
  LogOut,
  ArrowLeft,
  UserPlus,
  Search
} from "lucide-react";

interface ClubMember {
  id: string;
  user_id: string;
  elo_rating: number;
  joined_at: string;
  profiles: {
    username: string;
    first_name: string | null;
    last_name: string | null;
  };
}

const ClubMembers = () => {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const { user, signOut, isAdmin } = useAuth();
  const { toast } = useToast();
  
  const [members, setMembers] = useState<ClubMember[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (clubId) {
      fetchMembers();
      if (user) {
        checkMembership();
      }
    }
  }, [clubId, user]);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from("club_members")
        .select(`
          *,
          profiles (username, first_name, last_name)
        `)
        .eq("club_id", clubId)
        .order("elo_rating", { ascending: false });

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkMembership = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("club_members")
        .select("id")
        .eq("club_id", clubId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      setIsMember(!!data);
    } catch (error) {
      console.error("Error checking membership:", error);
    }
  };

  const handleJoinClub = async () => {
    if (!user || !clubId) return;

    try {
      const { error } = await supabase
        .from("club_members")
        .insert({
          club_id: clubId,
          user_id: user.id,
          elo_rating: 1500,
        });

      if (error) throw error;

      toast({
        title: "Bienvenue !",
        description: "Vous avez rejoint le club avec succès",
      });

      setIsMember(true);
      fetchMembers();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible de rejoindre le club",
      });
    }
  };

  const filteredMembers = members.filter((member) =>
    member.profiles.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-3xl font-bold">Membres du club</h1>
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
            <Button variant="default">
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
          {user && !isMember && (
            <Card className="border-green-500 bg-green-50">
              <CardHeader>
                <CardTitle>Rejoignez le club</CardTitle>
                <CardDescription>
                  Devenez membre pour participer aux tournois et aux discussions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleJoinClub}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Rejoindre le club
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un membre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Classement ELO</CardTitle>
              <CardDescription>
                {filteredMembers.length} membre{filteredMembers.length > 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center py-8 text-muted-foreground">
                  Chargement...
                </p>
              ) : filteredMembers.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  Aucun membre trouvé
                </p>
              ) : (
                <div className="space-y-2">
                  {filteredMembers.map((member, index) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold">
                            {member.profiles.username}
                          </p>
                          {(member.profiles.first_name || member.profiles.last_name) && (
                            <p className="text-sm text-muted-foreground">
                              {member.profiles.first_name} {member.profiles.last_name}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{member.elo_rating}</p>
                        <p className="text-xs text-muted-foreground">ELO</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ClubMembers;
