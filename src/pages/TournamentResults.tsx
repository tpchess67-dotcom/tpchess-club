import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TournamentResults() {
  const { clubId, tournamentId } = useParams();
  const [results, setResults] = useState<any[]>([]);
  const [tournament, setTournament] = useState<any>(null);

  useEffect(() => {
    if (!tournamentId) return;
    fetchResults();
    fetchTournament();
  }, [tournamentId]);

  const fetchTournament = async () => {
    try {
      const { data, error } = await supabase.from('tournaments').select('*').eq('id', tournamentId).maybeSingle();
      if (error) throw error;
      setTournament(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchResults = async () => {
    try {
      // expects a view or table tournament_final_ranking with tournament_id
      const { data, error } = await supabase
        .from('tournament_final_ranking')
        .select('*')
        .eq('tournament_id', tournamentId)
        .order('rank', { ascending: true });
      if (error) throw error;
      setResults(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Classement final {tournament?.name || ''}</CardTitle>
            </CardHeader>
            <CardContent>
              {results.length===0 ? <div>Aucun résultat publié</div> : (
                <div className="space-y-2">
                  {results.map(r => (
                    <div key={r.user_id} className="flex justify-between p-2 border rounded">
                      <div>{r.rank}. {r.full_name || r.email}</div>
                      <div>{r.score}</div>
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
}
