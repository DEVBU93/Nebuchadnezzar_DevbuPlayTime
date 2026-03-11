import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';

export function AchievementsPage() {
  const { accessToken } = useAuthStore();
  const { data, isLoading } = useQuery({
    queryKey: ['achievements'],
    queryFn: async () => {
      const res = await fetch('/api/achievements', { headers: { Authorization: `Bearer ${accessToken}` } });
      if (!res.ok) throw new Error('Error');
      return res.json();
    }
  });

  if (isLoading) return <div style={{ padding: 40, color: '#a6adc8' }}>Cargando Logros...</div>;

  return (
    <div style={{ padding: '24px 32px', maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ color: '#a6e3a1', fontSize: 28, marginBottom: 8 }}>🏅 Logros</h1>
      <p style={{ color: '#a6adc8', marginBottom: 24 }}>Sección en desarrollo activo.</p>
      {Array.isArray(data?.data) && data.data.length === 0 && (
        <div style={{ background: '#1e1e2e', border: '1px solid #313244', borderRadius: 12, padding: 32, textAlign: 'center' }}>
          <p style={{ color: '#6c7086', fontSize: 16 }}>Nada que mostrar aún — ¡sigue jugando!</p>
        </div>
      )}
    </div>
  );
}
