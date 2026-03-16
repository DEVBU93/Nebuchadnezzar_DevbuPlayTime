import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export function AuthLayout() {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-base flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-mauve/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue/10 rounded-full blur-3xl" />
      </div>
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-mauve mb-2">DevbuPlaytime</h1>
          <p className="text-subtext0">Aprende jugando. Crece conquistando.</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
