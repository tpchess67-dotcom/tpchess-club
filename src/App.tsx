import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import ClubHome from "./pages/ClubHome";
import ClubMembers from "./pages/ClubMembers";
import ClubProfile from "./pages/ClubProfile";
import ClubTournaments from "./pages/ClubTournaments";
import NotFound from "./pages/NotFound";
import AdminUsers from "./pages/AdminUsers";
import TournamentResults from "./pages/TournamentResults";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/club/:clubId" element={<ClubHome />} />
            <Route path="/club/:clubId/members" element={<ClubMembers />} />
            <Route path="/club/:clubId/profile" element={<ClubProfile />} />
            <Route path="/club/:clubId/tournaments" element={<ClubTournaments />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/club/:clubId/tournaments/:tournamentId/results" element={<TournamentResults />} />
            <Route path="/admin/users" element={<(await import('./pages/AdminUsers')).default />} />\n            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
