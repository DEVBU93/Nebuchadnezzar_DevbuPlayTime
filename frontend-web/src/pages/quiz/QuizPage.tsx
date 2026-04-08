import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { toast } from 'react-hot-toast';

interface Question {
  id: string;
  text: string;
  type: string;
  options: string[];
  points: number;
}

interface QuizSession {
  sessionId: string;
  missionName: string;
  totalQuestions: number;
  questions: Question[];
}

export default function QuizPage() {
  const { missionId } = useParams();
  const navigate = useNavigate();
  const { accessToken } = useAuthStore();
  
  const [session, setSession] = useState<QuizSession | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<{ isCorrect: boolean; pointsEarned: number; correctAnswer?: string; explanation?: string } | null>(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [rewards, setRewards] = useState<{ xp: number; coins: number } | null>(null);

  useEffect(() => {
    if (!missionId) return;
    
    const startSession = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/quiz/session/start', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json', 
            Authorization: `Bearer ${accessToken}` 
          },
          body: JSON.stringify({ missionId })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setSession(data.data);
      } catch (e: any) {
        toast.error(e.message || 'Error al iniciar el quiz');
        navigate('/worlds');
      } finally {
        setLoading(false);
      }
    };

    startSession();
  }, [missionId, accessToken, navigate]);

  const handleAnswer = async (option: string) => {
    if (result || !session) return;
    setSelected(option);
    
    try {
      const res = await fetch('/api/quiz/session/answer', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${accessToken}` 
        },
        body: JSON.stringify({ 
          sessionId: session.sessionId, 
          questionId: session.questions[currentIdx].id, 
          answer: option 
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      setResult(data.data);
      if (data.data.isCorrect) {
        setScore(s => s + data.data.pointsEarned);
        toast.success('¡Correcto!', { duration: 1000 });
      } else {
        toast.error('Incorrecto', { duration: 1000 });
      }
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleNext = async () => {
    if (!session) return;

    if (currentIdx < session.questions.length - 1) {
      setCurrentIdx(i => i + 1);
      setSelected(null);
      setResult(null);
    } else {
      // Finalizar sesión y obtener recompensas
      setLoading(true);
      try {
        const res = await fetch('/api/quiz/session/complete', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json', 
            Authorization: `Bearer ${accessToken}` 
          },
          body: JSON.stringify({ sessionId: session.sessionId })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        
        setRewards(data.data.rewards);
        setCompleted(true);
      } catch (e: any) {
        toast.error(e.message || 'Error al finalizar el quiz');
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading && !session) return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-mauve border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-subtext0">Preparando tu misión...</p>
      </div>
    </div>
  );

  if (completed && rewards) return (
    <div className="p-8 max-w-2xl mx-auto text-center">
      <div className="bg-mantle border border-surface0 rounded-2xl p-12 shadow-xl">
        <div className="text-6xl mb-6">🎉</div>
        <h1 className="text-3xl font-bold text-text mb-2">¡Misión Completada!</h1>
        <p className="text-subtext0 mb-8">{session?.missionName}</p>
        
        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="bg-surface0 p-6 rounded-2xl border border-surface1">
            <p className="text-sm text-subtext1 uppercase tracking-wider mb-1">Puntos Base</p>
            <p className="text-3xl font-bold text-mauve">{score}</p>
          </div>
          <div className="bg-surface0 p-6 rounded-2xl border border-surface1">
            <p className="text-sm text-subtext1 uppercase tracking-wider mb-1">XP Ganada</p>
            <p className="text-3xl font-bold text-blue">{rewards.xp}</p>
          </div>
          <div className="bg-surface0 p-6 rounded-2xl border border-surface1 col-span-2">
            <p className="text-sm text-subtext1 uppercase tracking-wider mb-1">Monedas Recibidas</p>
            <p className="text-3xl font-bold text-yellow">🪙 {rewards.coins}</p>
          </div>
        </div>

        <button
          onClick={() => navigate('/worlds')}
          className="w-full bg-mauve text-base font-bold py-4 rounded-xl hover:bg-mauve/90 transition-all shadow-lg shadow-mauve/20"
        >
          Volver a los Mundos
        </button>
      </div>
    </div>
  );

  if (!session) return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold text-text mb-4">Misión no encontrada</h1>
      <button onClick={() => navigate('/worlds')} className="text-mauve hover:underline">Volver a Mundos</button>
    </div>
  );

  const questions = session.questions;
  const question = questions[currentIdx];
  const progress = ((currentIdx + 1) / questions.length) * 100;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between items-end text-sm mb-3">
          <div>
            <p className="text-subtext1 uppercase text-xs font-bold tracking-widest mb-1">Progreso</p>
            <span className="text-text font-medium">Pregunta {currentIdx + 1} de {questions.length}</span>
          </div>
          <div className="text-right">
            <p className="text-subtext1 uppercase text-xs font-bold tracking-widest mb-1">Score</p>
            <span className="text-green font-bold text-lg">{score} pts</span>
          </div>
        </div>
        <div className="h-2.5 bg-surface0 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-mauve to-pink rounded-full transition-all duration-500 ease-out" 
            style={{ width: `${progress}%` }} 
          />
        </div>
      </div>

      <div className="bg-mantle border border-surface0 rounded-3xl p-8 shadow-lg">
        <div className="mb-8">
          <span className="inline-block px-3 py-1 rounded-full bg-mauve/10 text-mauve text-xs font-bold uppercase mb-4">
            {question.type.replace('_', ' ')}
          </span>
          <h2 className="text-2xl font-bold text-text leading-tight">{question.text}</h2>
        </div>

        <div className="space-y-3">
          {question.options.map((opt) => {
            let classes = 'w-full text-left px-6 py-4 rounded-2xl border-2 transition-all duration-200 font-semibold text-lg flex justify-between items-center ';
            
            if (!result) {
              classes += selected === opt
                ? 'bg-mauve/10 border-mauve text-mauve'
                : 'bg-surface0 border-transparent text-text hover:border-mauve/30 hover:bg-surface1';
            } else {
              if (opt === result.correctAnswer) {
                classes += 'bg-green/10 border-green text-green shadow-sm shadow-green/10';
              } else if (opt === selected && !result.isCorrect) {
                classes += 'bg-red/10 border-red text-red';
              } else {
                classes += 'bg-surface0 border-transparent text-subtext1 opacity-60';
              }
            }

            return (
              <button 
                key={opt} 
                onClick={() => handleAnswer(opt)} 
                disabled={!!result || loading} 
                className={classes}
              >
                <span>{opt}</span>
                {result && opt === result.correctAnswer && <span>✓</span>}
                {result && opt === selected && !result.isCorrect && <span>✗</span>}
              </button>
            );
          })}
        </div>

        {result && (
          <div className={`mt-8 p-6 rounded-2xl animate-in fade-in slide-in-from-bottom-2 duration-300 ${
            result.isCorrect ? 'bg-green/5 border border-green/20' : 'bg-red/5 border border-red/20'
          }`}>
            <p className={`text-lg font-bold mb-1 ${result.isCorrect ? 'text-green' : 'text-red'}`}>
              {result.isCorrect ? '✨ ¡Excelente trabajo!' : '💡 ¡Casi lo tienes!'}
            </p>
            {result.explanation && (
              <p className="text-subtext0 text-sm italic leading-relaxed">{result.explanation}</p>
            )}
          </div>
        )}

        {result && (
          <button
            onClick={handleNext}
            disabled={loading}
            className="mt-8 w-full bg-mauve text-base font-bold py-4 rounded-2xl hover:bg-mauve/90 transition-all shadow-lg shadow-mauve/20 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              currentIdx < session.questions.length - 1 ? 'Siguiente Pregunta →' : 'Ver Resultados Finales'
            )}
          </button>
        )}
      </div>
    </div>
  );
}
