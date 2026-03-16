import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import { useAuthStore } from './stores/authStore';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// ─── Pages ───────────────────────────────────────────────────────────────────
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import HomePage from './pages/home/HomePage';
import WorldsPage from './pages/worlds/WorldsPage';
import WorldDetailPage from './pages/worlds/WorldDetailPage';
import ChaptersPage from './pages/chapters/ChaptersPage';
import MissionPage from './pages/missions/MissionPage';
import QuizPage from './pages/quiz/QuizPage';
import ArenaPage from './pages/arena/ArenaPage';
import ArenaRoomPage from './pages/arena/ArenaRoomPage';
import ProfilePage from './pages/profile/ProfilePage';
import ShopPage from './pages/shop/ShopPage';
import LeaderboardPage from './pages/leaderboard/LeaderboardPage';
import AchievementsPage from './pages/achievements/AchievementsPage';
import NotFoundPage from './pages/NotFoundPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 min
      retry: 2,
    },
  },
});

// ─── Protected Route ──────────────────────────────────────────────────────────
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { background: '#1e1e2e', color: '#cdd6f4', border: '1px solid #313244' },
          }}
        />
        <Routes>
          {/* ─── Auth ─── */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* ─── Main App ─── */}
          <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route path="/" element={<HomePage />} />
            <Route path="/worlds" element={<WorldsPage />} />

            {/* Mundos y Progreso */}
            <Route path="/worlds/:worldId" element={<WorldDetailPage />} />
            <Route path="/worlds/:worldId/chapters" element={<ChaptersPage />} />
            <Route path="/worlds/:worldId/chapters/:chapterId/missions" element={<MissionPage />} />
            <Route path="/worlds/:worldId/chapters/:chapterId/missions/:missionId/quiz" element={<QuizPage />} />

            {/* Quiz y Arena */}
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/arena" element={<ArenaPage />} />
            <Route path="/arena/:roomId" element={<ArenaRoomPage />} />

            {/* Perfil y Social */}
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/achievements" element={<AchievementsPage />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
