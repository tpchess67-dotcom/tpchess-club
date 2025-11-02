import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function AdminUsers() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const toast = useToast();

  useEffect(() => {
    if (!isAdmin) return;
    fetchUsers();
  }, [isAdmin]);

  const fetchUsers = async () => {
    const { data, error } = await supabase.from('users_view').select('*');
    if (error) return toast({ variant: 'destructive', title: 'Erreur', description: error.message });
    setUsers(data || []);
  };

  const promote = async (userId: string, role: string) => {
    const { error } = await supabase.from('user_roles').upsert({ user_id: userId, role });
    if (error) return toast({ variant: 'destructive', title: 'Erreur', description: error.message });
    toast({ title: 'Succès', description: `Utilisateur promu ${role}` });
    fetchUsers();
  };

  if (!isAdmin) return <div>Accès refusé</div>;

  return (
    <div className="p-4">\n      <div className="mb-4">\n        <h3 className="font-semibold">Assigner modérateur à un club</h3>\n        {clubs.length===0 ? <div>Chargement clubs...</div> : (\n          <div className="space-y-2">\n            {users.map(u => (\n              <div key={u.id} className="flex items-center gap-2">\n                <div className="flex-1">{u.email}</div>\n                <select onChange={(e)=> assignModeratorToClub(u.id, e.target.value)} className="border px-2 py-1">\n                  <option value="">Choisir un club</option>\n                  {clubs.map(c=> (<option key={c.id} value={c.id}>{c.name}</option>))}\n                </select>\n              </div>\n            ))}\n          </div>\n        )}\n      </div>
      <h1 className="text-2xl font-bold mb-4">Gestion des utilisateurs</h1>
      <div className="space-y-2">
        {users.map(u => (
          <div key={u.id} className="flex items-center justify-between p-2 border rounded">
            <div>
              <div className="font-semibold">{u.email}</div>
              <div className="text-sm text-muted-foreground">{u.full_name || ''}</div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => promote(u.id, 'moderator')}>Promouvoir modérateur</Button>
              <Button onClick={() => promote(u.id, 'admin')}>Promouvoir admin</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
