import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';

export function ChaptersPage() {
  const { worldId } = useParams<{ worldId: string }>();
  const navigate = useNavigate();
  const { accessToken } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['chapters', worldId],
    queryFn: async () => {
      const res = await fetch(`/api/worlds/${worldId}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (!res.ok) throw new Error('Error');
      return res.json();
    },
    enabled: !!worldId
  });

  if (isLoading) return <div style={{ padding: 40, color: '#a6adc8' }}>Cargando capítulos...</div>;

  const chapters = data?.data?.chapters || [];

  return (
    <div style={{ padding: '24px 32px', maxWidth: 900, margin: '0 auto' }}>
      <button onClick={() => navigate(`/worlds/${worldId}`)} style={{ background: 'none', border: '1px solid #313244', color: '#a6adc8', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', marginBottom: 24 }}>
        ← Volver
      </button>
      <h1 style={{ color: '#cba6f7', fontSize: 28, marginBottom: 24 }}>Capítulos</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {chapters.map((ch: any) => (
          <div key={ch.id} style={{ background: '#1e1e2e', border: '1px solid #313244', borderRadius: 10, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
            onClick={() => navigate(`/worlds/${worldId}/chapters/${ch.id}/missions`)}>
            <span style={{ color: '#cdd6f4', fontWeight: 600 }}>{ch.name}</span>
            <span style={{ color: '#a6adc8' }}>→</span>
          </div>
        ))}
      </div>
    </div>
  );
}
