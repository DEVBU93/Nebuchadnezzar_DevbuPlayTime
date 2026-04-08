import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

const navItems = [
  { path: '/', label: 'Inicio', icon: '🏠' },
  { path: '/worlds', label: 'Mundos', icon: '🌍' },
  { path: '/quiz', label: 'Quiz', icon: '❓' },
  { path: '/arena', label: 'Arena', icon: '⚔️' },
  { path: '/master', label: 'Master V3 🗺️', icon: '📋' },  // Integra public/master.html
  { path: '/profile', label: 'Perfil', icon: '👤' }
];

export function MainLayout() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/auth/login" replace />;

  return (
    <div className="min-h-screen bg-base flex">
      {/* Sidebar */}
      <aside className="w-64 bg-mantle border-r border-surface0 flex flex-col">
        <div className="p-6 border-b border-surface0">
          <h1 className="text-xl font-bold text-mauve">Dpngame</h1>
          <p className="text-xs text-subtext0 mt-1">v1.0.0 — by DEVBU93</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ path, label, icon }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                location.pathname === path
                  ? 'bg-mauve/20 text-mauve'
                  : 'text-subtext1 hover:bg-surface0 hover:text-text'
              }`}
            >
              <span className="text-base">{icon}</span>
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-surface0">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-mauve/20 flex items-center justify-center text-mauve font-bold">
              {user?.displayName?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text truncate">{user?.displayName}</p>
              <p className="text-xs text-subtext0 truncate">{user?.username}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full text-xs text-red hover:text-red/80 transition-colors text-left px-2 py-1.5 rounded hover:bg-red/10"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>
      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
