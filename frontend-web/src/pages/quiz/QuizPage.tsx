import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';

interface Question {
  id: string;
  text: string;
  type: string;
  options: string[];
  points: number;
}

export default function QuizPage() {
  const { missionId } = useParams();
  const { accessToken } = useAuthStore();
  const navigate = useNavigate();
  const [session, setSession] = useState<{ sessionId: string; questions: Question[] } | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<{ isCorrect: boolean; pointsEarned: number; correctAnswer: string } | null>(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!missionId) return;
    const startSession = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/quiz/session/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
          body: JSON.stringify({ missionId })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setSession(data.data);
      } catch (e: any) {
        toast.error(e.message);
        navigate('/worlds');
      } finally {
        setLoading(false);
      }
    };
    startSession();
  }, [missionId]);

  if (!missionId) return (
    <div className="p-8 text-center">
      <h1 className="text-2xl font-bold text-text mb-4">Selecciona una misión</h1>
      <p className="text-subtext0">Ve a Mundos y elige una misión para comenzar el quiz</p>
    </div>
  );

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-mauve border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-subtext0">Preparando tu misión...</p>
      </div>
    </div>
  );

  if (!session) return null;

  const questions = session.questions;
  const question = questions[currentIdx];

  const handleAnswer = async (option: string) => {
    if (result) return;
    setSelected(option);
    const res = await fetch('/api/quiz/session/answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ sessionId: session.sessionId, questionId: question.id, answer: option })
    });
    const data = await res.json();
    setResult(data.data);
    if (data.data.isCorrect) setScore(s => s + data.data.pointsEarned);
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(i => i + 1);
      setSelected(null);
      setResult(null);
    } else {
      toast.success(`¡Quiz completado! Puntuación: ${score} pts`);
      navigate('/worlds');
    }
  };

  const progress = ((currentIdx + 1) / questions.length) * 100;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="flex justify-between text-sm text-subtext1 mb-2">
          <span>Pregunta {currentIdx + 1} de {questions.length}</span>
          <span className="text-green font-medium">{score} pts</span>
        </div>
        <div className="h-2 bg-surface0 rounded-full">
          <div className="h-full bg-mauve rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="bg-mantle border border-surface0 rounded-2xl p-8">
        <p className="text-xl font-semibold text-text mb-8 leading-relaxed">{question.text}</p>
        <div className="space-y-3">
          {question.options.map((opt) => {
            let classes = 'w-full text-left px-5 py-3.5 rounded-xl border transition-all font-medium ';
            if (!result) {
              classes += selected === opt
                ? 'bg-mauve/20 border-mauve text-mauve'
                : 'bg-surface0 border-surface1 text-text hover:border-mauve/50';
            } else {
              if (opt === result.correctAnswer) classes += 'bg-green/20 border-green text-green';
              else if (opt === selected && !result.isCorrect) classes += 'bg-red/20 border-red text-red';
              else classes += 'bg-surface0 border-surface1 text-subtext1';
            }
            return (
              <button key={opt} onClick={() => handleAnswer(opt)} disabled={!!result} className={classes}>
                {opt}
              </button>
            );
          })}
        </div>
        {result && (
          <div className={`mt-6 p-4 rounded-xl ${result.isCorrect ? 'bg-green/10 border border-green/30' : 'bg-red/10 border border-red/30'}`}>
            <p className={`font-semibold ${result.isCorrect ? 'text-green' : 'text-red'}`}>
              {result.isCorrect ? `✅ ¡Correcto! +${result.pointsEarned} pts` : `❌ Incorrecto. Respuesta: ${result.correctAnswer}`}
            </p>
          </div>
        )}
        {result && (
          <button
            onClick={handleNext}
            className="mt-4 w-full bg-mauve text-base font-semibold py-3 rounded-xl hover:bg-mauve/90 transition-colors"
          >
            {currentIdx < questions.length - 1 ? 'Siguiente pregunta →' : '¡Finalizar!'}
          </button>
        )}
      </div>
    </div>
  );
}
