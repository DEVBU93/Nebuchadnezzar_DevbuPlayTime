import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

const fetchProgress = async (token: string) => {
  const res = await fetch('/api/progress', { headers: { Authorization: `Bearer ${token}` } });
  return res.json();
};

const fetchWorlds = async () => {
  const res = await fetch('/api/worlds');
  return res.json();
};

export default function HomePage() {
  const { user, accessToken } = useAuthStore();
  const { data: progressData } = useQuery({
    queryKey: ['progress'],
    queryFn: () => fetchProgress(accessToken!),
    enabled: !!accessToken
  });
  const { data: worldsData } = useQuery({ queryKey: ['worlds'], queryFn: fetchWorlds });

  const progress = progressData?.data;
  const worlds = worldsData?.data || [];

  const xpToNextLevel = (progress?.level || 1) * 1000;
  const xpPercent = Math.min(((progress?.totalXp || 0) % xpToNextLevel) / xpToNextLevel * 100, 100);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Hero */}
      <div className="bg-gradient-to-br from-mauve/20 to-blue/10 border border-mauve/30 rounded-2xl p-8 mb-8">
        <h1 className="text-3xl font-bold text-text mb-2">
          ¡Hola, <span className="text-mauve">{user?.displayName}</span>! 🎮
        </h1>
        <p className="text-subtext0 mb-6">Continúa tu aventura de aprendizaje</p>
        <div className="flex items-center gap-6">
          <div className="flex-1">
            <div className="flex justify-between text-sm text-subtext1 mb-1.5">
              <span>Nivel {progress?.level || 1}</span>
              <span>{progress?.totalXp || 0} XP</span>
            </div>
            <div className="h-2.5 bg-surface0 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-mauve to-blue rounded-full transition-all duration-500"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow">🪙 {progress?.coins || 0}</p>
            <p className="text-xs text-subtext0">monedas</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Mundos completados', value: progress?.worldsCompleted || 0, icon: '🌍', color: 'blue' },
          { label: 'Misiones completadas', value: progress?.missionsCompleted || 0, icon: '✅', color: 'green' },
          { label: 'Victorias en Arena', value: progress?.arenaWins || 0, icon: '⚔️', color: 'peach' }
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="bg-mantle border border-surface0 rounded-xl p-5">
            <p className="text-3xl mb-2">{icon}</p>
            <p className={`text-2xl font-bold text-${color}`}>{value}</p>
            <p className="text-xs text-subtext0 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Worlds preview */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-text">Mundos Disponibles</h2>
          <Link to="/worlds" className="text-mauve text-sm hover:underline">Ver todos →</Link>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {worlds.slice(0, 4).map((world: any) => (
            <Link
              key={world.id}
              to={`/worlds/${world.id}`}
              className="bg-mantle border border-surface0 rounded-xl p-5 hover:border-mauve/50 transition-colors group"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl">🌍</span>
                <span className="text-xs bg-surface0 text-subtext1 px-2 py-0.5 rounded-full capitalize">
                  {world.difficulty?.toLowerCase()}
                </span>
              </div>
              <h3 className="font-semibold text-text group-hover:text-mauve transition-colors">{world.name}</h3>
              <p className="text-xs text-subtext0 mt-1 line-clamp-2">{world.description}</p>
              <p className="text-xs text-blue mt-2">{world.chapters?.length || 0} capítulos</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
