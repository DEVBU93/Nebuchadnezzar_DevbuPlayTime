import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';

export function MissionPage() {
  const { worldId, chapterId, missionId } = useParams();
  const navigate = useNavigate();
  const { accessToken } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['mission', missionId],
    queryFn: async () => {
      const res = await fetch(`/api/missions/${missionId}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (!res.ok) throw new Error('Error');
      return res.json();
    },
    enabled: !!missionId
  });

  if (isLoading) return <div style={{ padding: 40, color: '#a6adc8' }}>Cargando misión...</div>;
  const mission = data?.data;

  return (
    <div style={{ padding: '24px 32px', maxWidth: 800, margin: '0 auto' }}>
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: '1px solid #313244', color: '#a6adc8', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', marginBottom: 24 }}>
        ← Volver
      </button>
      {mission ? (
        <>
          <h1 style={{ color: '#cba6f7', fontSize: 28, marginBottom: 8 }}>{mission.name}</h1>
          <p style={{ color: '#a6adc8', marginBottom: 24 }}>{mission.description}</p>
          <div style={{ display: 'flex', gap: 16 }}>
            {mission.type === 'QUIZ' && (
              <button onClick={() => navigate(`/quiz/${missionId}`)}
                style={{ background: '#cba6f7', color: '#1e1e2e', border: 'none', borderRadius: 10, padding: '12px 24px', cursor: 'pointer', fontWeight: 700, fontSize: 16 }}>
                🎯 Iniciar Quiz
              </button>
            )}
          </div>
        </>
      ) : (
        <p style={{ color: '#f38ba8' }}>Misión no encontrada</p>
      )}
    </div>
  );
}
