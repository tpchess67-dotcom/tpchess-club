import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
  Plus,
  MessageSquare
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Club {
  id: string;
  name: string;
  description: string;
  color_primary: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  created_at: string;
  author_id: string;
  profiles: {
    username: string;
  };
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  author_id: string;
  profiles: {
    username: string;
  };
}

const ClubHome = () => {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const { user, signOut, isAdmin } = useAuth();
  const { toast } = useToast();
  
  const [club, setClub] = useState<Club | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // New post state
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [showNewPost, setShowNewPost] = useState(false);

  useEffect(() => {
    if (clubId) {
      fetchClubData();
      fetchPosts();
      if (user) {
        checkMembership();
      }
    }
  }, [clubId, user]);

  // Fetch tournaments and general elo ranking
  const fetchTournaments = async () => {
    if (!clubId) return;
    try {
      const { data, error } = await supabase.from('tournaments').select('*').eq('club_id', clubId).in('status',['ongoing','upcoming']).order('starts_at', { ascending: true });
      if (error) throw error;
      setTournaments(data || []);
    } catch (error) {
      console.error('Error fetching tournaments', error);
    }
  };

  const fetchEloRanking = async () => {
    try {
      const { data, error } = await supabase.rpc('club_general_elo_ranking', { club_uuid: clubId });
      if (error) throw error;
      setEloRanking(data || []);
    } catch (error) {
      console.error('Error fetching elo ranking', error);
    }
  };

  useEffect(() => {
    fetchTournaments();
    fetchEloRanking();
  }, [club]);

  const fetchClubData = async () => {
    try {
      const { data, error } = await supabase
        .from("clubs")
        .select("*")
        .eq("id", clubId)
        .single();

      if (error) throw error;
      setClub(data);
    } catch (error) {
      console.error("Error fetching club:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les données du club",
      });
    }
  };

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select(`
          *,
          profiles (username)
        `)
        .eq("club_id", clubId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
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

  const handleCreatePost = async () => {
    if (!user || !newPostTitle || !newPostContent) return;

    try {
      const { error } = await supabase
        .from("posts")
        .insert({
          club_id: clubId,
          author_id: user.id,
          title: newPostTitle,
          content: newPostContent,
        });

      if (error) throw error;

      toast({
        title: "Publication créée",
        description: "Votre message a été publié avec succès",
      });

      setNewPostTitle("");
      setNewPostContent("");
      setShowNewPost(false);
      fetchPosts();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Impossible de créer la publication",
      });
    }
  };

  if (loading || !club) {
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
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux clubs
            </Button>
            {user && (
              <Button variant="outline" onClick={signOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Déconnexion
              </Button>
            )}
          </div>
          <h1 className="text-3xl font-bold mb-2">{club.name}</h1>
          <p className="text-muted-foreground">{club.description}</p>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b bg-card">
        <div className="container mx-auto px-4">
          <div className="flex gap-4 overflow-x-auto">
            <Button variant="ghost" className="flex items-center gap-2" onClick={() => navigate(`/club/${clubId}`)}>
              <Home className="w-4 h-4" />
              Accueil
            </Button>
            <Button variant="ghost" className="flex items-center gap-2" onClick={() => navigate(`/club/${clubId}/tournaments`)}>
              <Trophy className="w-4 h-4" />
              Tournois
            </Button>
            <Button variant="ghost" className="flex items-center gap-2" onClick={() => navigate(`/club/${clubId}/members`)}>
              <Users className="w-4 h-4" />
              Membres
            </Button>
            {user && (
              <Button variant="ghost" className="flex items-center gap-2" onClick={() => navigate(`/club/${clubId}/profile`)}>
                <User className="w-4 h-4" />
                Mon Profil
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {!user && (
          <Card className="mb-6 border-yellow-500 bg-yellow-50">
            <CardHeader>
              <CardTitle>Connectez-vous pour participer</CardTitle>
              <CardDescription>
                Créez un compte pour rejoindre le club et accéder à toutes les fonctionnalités
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate("/auth")}>
                Se connecter
              </Button>
            </CardContent>
          </Card>
        )}

        {user && !isMember && (
          <Card className="mb-6 border-blue-500 bg-blue-50">
            <CardHeader>
              <CardTitle>Rejoignez le club</CardTitle>
              <CardDescription>
                Inscrivez-vous au club pour participer aux tournois et aux discussions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate(`/club/${clubId}/members`)}>
                Rejoindre le club
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Fil d'actualité</h2>
            {isMember && (
              <Button onClick={() => setShowNewPost(!showNewPost)}>
                <Plus className="w-4 h-4 mr-2" />
                Nouvelle publication
              </Button>
            )}
          </div>

          {showNewPost && (
            <Card>
              <CardHeader>
                <CardTitle>Nouvelle publication</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Titre de la publication"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                />
                <Textarea
                  placeholder="Contenu de la publication"
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  rows={4}
                />
                <div className="flex gap-2">
                  <Button onClick={handleCreatePost}>
                    Publier
                  </Button>
                  <Button variant="outline" onClick={() => setShowNewPost(false)}>
                    Annuler
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {posts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Aucune publication pour le moment
                </p>
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => (
              <Card key={post.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{post.title}</CardTitle>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(post.created_at), "Pp", { locale: fr })}
                    </span>
                  </div>
                  <CardDescription>
                    Par {post.profiles.username}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{post.content}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default ClubHome;
