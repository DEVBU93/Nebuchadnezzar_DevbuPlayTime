import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

const difficultyColor: Record<string, string> = {
  BEGINNER: 'text-green',
  INTERMEDIATE: 'text-yellow',
  ADVANCED: 'text-peach',
  EXPERT: 'text-red'
};

export default function WorldsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['worlds'],
    queryFn: async () => {
      const res = await fetch('/api/worlds');
      return res.json();
    }
  });

  const worlds = data?.data || [];

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text mb-2">Mundos de Aprendizaje</h1>
        <p className="text-subtext0">Explora universos del conocimiento y domina cada desafío</p>
      </div>
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-mantle border border-surface0 rounded-xl p-6 animate-pulse h-48" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {worlds.map((world: any) => (
            <Link
              key={world.id}
              to={`/worlds/${world.id}`}
              className="bg-mantle border border-surface0 rounded-xl p-6 hover:border-mauve/50 transition-all hover:shadow-lg hover:shadow-mauve/10 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-mauve/20 rounded-xl flex items-center justify-center text-2xl">
                  🌍
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full bg-surface0 ${difficultyColor[world.difficulty] || 'text-subtext1'}`}>
                  {world.difficulty}
                </span>
              </div>
              <h3 className="text-lg font-bold text-text group-hover:text-mauve transition-colors mb-1">
                {world.name}
              </h3>
              <p className="text-sm text-subtext0 line-clamp-2 mb-4">{world.description}</p>
              <div className="flex items-center gap-4 text-xs text-subtext1">
                <span>📚 {world.chapters?.length || 0} capítulos</span>
                <span>🎯 {world.chapters?.reduce((acc: number, c: any) => acc + (c.missions?.length || 0), 0)} misiones</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
