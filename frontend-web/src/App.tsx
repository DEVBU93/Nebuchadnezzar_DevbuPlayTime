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
import { WorldDetailPage } from './pages/worlds/WorldDetailPage';
import { ChaptersPage } from './pages/chapters/ChaptersPage';
import { MissionPage } from './pages/missions/MissionPage';
import QuizPage from './pages/quiz/QuizPage';
import ArenaPage from './pages/arena/ArenaPage';
import { ArenaRoomPage } from './pages/arena/ArenaRoomPage';
import ProfilePage from './pages/profile/ProfilePage';
import { ShopPage } from './pages/shop/ShopPage';
import { LeaderboardPage } from './pages/leaderboard/LeaderboardPage';
import { AchievementsPage } from './pages/achievements/AchievementsPage';
import NotFoundPage from './pages/NotFoundPage';

// src/lib/api.ts (nuevo archivo)
const apiUrl = import.meta.env.VITE_API_URL || 
               import.meta.env.VITE_API_URL_DEV || 
               'http://localhost:3000';

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${apiUrl}${endpoint}`;
  const token = localStorage.getItem('token');
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    }
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  
  return response.json();
};

// Login function
export const login = async (email: string, password: string) => {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
};

// Quiz functions
export const startSession = async (missionId: string) => {
  return apiFetch('/quiz/sessions/start', {
    method: 'POST',
    body: JSON.stringify({ missionId })
  });
};

export const submitAnswer = async (sessionId: string, questionId: string, answer: string) => {
  return apiFetch(`/quiz/sessions/${sessionId}/answer`, {
    method: 'POST',
    body: JSON.stringify({ questionId, answer })
  });
};
// Función helper para todas las llamadas API
const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${apiUrl}${endpoint}`;
  const token = localStorage.getItem('token');
  
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    }
  });
};

// Ejemplos de uso en tus hooks o componentes
const startQuiz = async (missionId: string) => {
  return apiFetch('/quiz/sessions/start', {
    method: 'POST',
    body: JSON.stringify({ missionId })
  });
};

const submitAnswer = async (sessionId: string, questionId: string, answer: string) => {
  return apiFetch(`/quiz/sessions/${sessionId}/answer`, {
    method: 'POST',
    body: JSON.stringify({ questionId, answer })
  });
};

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
  return isAuthenticated ? <>{children}</> : <Navigate to="/auth/login" replace />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          {/* Auth routes */}
          <Route element={<AuthLayout />}>
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/register" element={<RegisterPage />} />
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
          {/* Redirect /login and /register to /auth routes for backward compat */}
          <Route path="/login" element={<Navigate to="/auth/login" replace />} />
          <Route path="/register" element={<Navigate to="/auth/register" replace />} />
          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
