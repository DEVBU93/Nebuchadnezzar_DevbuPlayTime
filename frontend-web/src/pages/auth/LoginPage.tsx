import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al iniciar sesión');
      login(data.data.user, data.data.accessToken, data.data.refreshToken);
      toast.success(`¡Bienvenido, ${data.data.user.displayName}!`);
      navigate('/');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-mantle border border-surface0 rounded-2xl p-8">
      <h2 className="text-2xl font-bold text-text mb-1">Iniciar Sesión</h2>
      <p className="text-subtext0 text-sm mb-6">Continúa tu aventura de aprendizaje</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-subtext1 mb-1.5">Email</label>
          <input
            type="email" required
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            className="w-full bg-surface0 border border-surface1 rounded-lg px-4 py-2.5 text-text placeholder-overlay0 focus:outline-none focus:border-mauve transition-colors"
            placeholder="tu@email.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-subtext1 mb-1.5">Contraseña</label>
          <input
            type="password" required
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            className="w-full bg-surface0 border border-surface1 rounded-lg px-4 py-2.5 text-text placeholder-overlay0 focus:outline-none focus:border-mauve transition-colors"
            placeholder="••••••••"
          />
        </div>
        <button
          type="submit" disabled={loading}
          className="w-full bg-mauve text-base font-semibold py-2.5 rounded-lg hover:bg-mauve/90 disabled:opacity-50 transition-colors mt-2"
        >
          {loading ? 'Iniciando...' : 'Iniciar Sesión'}
        </button>
      </form>
      <p className="text-center text-subtext0 text-sm mt-6">
        ¿No tienes cuenta?{' '}
                <Link to="/register" className="text-mauve hover:underline font-medium">Regístrate</Link>
      </p>
    </div>
  );
}
