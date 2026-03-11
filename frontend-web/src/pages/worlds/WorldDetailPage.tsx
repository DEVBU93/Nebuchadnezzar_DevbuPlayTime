import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';

interface World {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  chapters?: Array<{ id: string; name: string; order: number }>;
}

export function WorldDetailPage() {
  const { worldId } = useParams<{ worldId: string }>();
  const navigate = useNavigate();
  const { accessToken } = useAuthStore();

  const { data, isLoading, isError } = useQuery<{ success: boolean; data: World }>({
    queryKey: ['world', worldId],
    queryFn: async () => {
      const res = await fetch(`/api/worlds/${worldId}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (!res.ok) throw new Error('Error al cargar el mundo');
      return res.json();
    },
    enabled: !!worldId
  });

  if (isLoading) return (
    <div style={{ padding: 40, textAlign: 'center', color: '#a6adc8' }}>Cargando mundo...</div>
  );
  if (isError || !data?.data) return (
    <div style={{ padding: 40, textAlign: 'center', color: '#f38ba8' }}>
      Error al cargar el mundo. <button onClick={() => navigate('/worlds')}>Volver</button>
    </div>
  );

  const world = data.data;

  return (
    <div style={{ padding: '24px 32px', maxWidth: 900, margin: '0 auto' }}>
      <button
        onClick={() => navigate('/worlds')}
        style={{ background: 'none', border: '1px solid #313244', color: '#a6adc8', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', marginBottom: 24 }}
      >
        ← Volver a Mundos
      </button>
      <h1 style={{ color: '#cba6f7', fontSize: 32, marginBottom: 8 }}>{world.name}</h1>
      {world.description && (
        <p style={{ color: '#a6adc8', fontSize: 16, marginBottom: 32 }}>{world.description}</p>
      )}
      <h2 style={{ color: '#89b4fa', fontSize: 20, marginBottom: 16 }}>Capítulos</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
        {(world.chapters || []).sort((a, b) => a.order - b.order).map(chapter => (
          <div
            key={chapter.id}
            onClick={() => navigate(`/worlds/${worldId}/chapters`)}
            style={{
              background: '#1e1e2e', border: '1px solid #313244', borderRadius: 12, padding: '20px 24px',
              cursor: 'pointer', transition: 'border-color 0.15s'
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = '#cba6f7')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = '#313244')}
          >
            <span style={{ fontSize: 24, marginBottom: 8, display: 'block' }}>📖</span>
            <p style={{ color: '#cdd6f4', fontWeight: 600, margin: 0 }}>{chapter.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
