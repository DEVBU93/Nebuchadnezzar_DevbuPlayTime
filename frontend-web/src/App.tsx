import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import { useAuthStore } from './stores/authStore';
import { MainLayout } from './layouts/MainLayout';
import { AuthLayout } from './layouts/AuthLayout';

// ---- Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import HomePage from './pages/home/HomePage';
import WorldsPage from './pages/worlds/WorldsPage';
import {WorldDetailPage} from './pages/worlds/WorldDetailPage';
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
      retry: 1,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          {/* Auth routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Protected routes */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
            <Route path="/worlds" element={<ProtectedRoute><WorldsPage /></ProtectedRoute>} />
            <Route path="/worlds/:worldId" element={<ProtectedRoute><WorldDetailPage /></ProtectedRoute>} />
            <Route path="/worlds/:worldId/chapters" element={<ProtectedRoute><ChaptersPage /></ProtectedRoute>} />
            <Route path="/missions/:missionId" element={<ProtectedRoute><MissionPage /></ProtectedRoute>} />
            <Route path="/quiz/:missionId" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
            <Route path="/arena" element={<ProtectedRoute><ArenaPage /></ProtectedRoute>} />
            <Route path="/arena/:roomId" element={<ProtectedRoute><ArenaRoomPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/shop" element={<ProtectedRoute><ShopPage /></ProtectedRoute>} />
            <Route path="/leaderboard" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
            <Route path="/achievements" element={<ProtectedRoute><AchievementsPage /></ProtectedRoute>} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
