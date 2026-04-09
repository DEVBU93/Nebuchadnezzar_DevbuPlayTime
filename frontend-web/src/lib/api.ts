// API base URL: uses VITE_API_URL env var in production, falls back to proxy path for dev
const apiUrl = import.meta.env.VITE_API_URL || '';

// Generic fetch wrapper with auth token and error handling
export const apiFetch = async (endpoint: string, options: RequestInit = {}): Promise<unknown> => {
  const url = `${apiUrl}${endpoint}`;
  const token = localStorage.getItem('token');

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    let errorMessage = `API Error: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      // Ignore JSON parse errors
    }
    throw new Error(errorMessage);
  }

  // Handle 204 No Content
  if (response.status === 204) return null;

  return response.json();
};

// Auth endpoints
export const login = async (email: string, password: string) => {
  return apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
};

export const register = async (username: string, email: string, password: string) => {
  return apiFetch('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password }),
  });
};

// Quiz endpoints
export const startQuizSession = async (missionId: string) => {
  return apiFetch('/api/quiz/sessions/start', {
    method: 'POST',
    body: JSON.stringify({ missionId }),
  });
};

export const submitAnswer = async (sessionId: string, questionId: string, answerId: string) => {
  return apiFetch(`/api/quiz/sessions/${sessionId}/answer`, {
    method: 'POST',
    body: JSON.stringify({ questionId, answerId }),
  });
};

export const completeQuizSession = async (sessionId: string) => {
  return apiFetch(`/api/quiz/sessions/${sessionId}/complete`, {
    method: 'POST',
  });
};

// Leaderboard
export const getLeaderboard = async (limit = 10) => {
  return apiFetch(`/api/users/leaderboard?limit=${limit}`);
};

// User profile
export const getUserProfile = async () => {
  return apiFetch('/api/users/profile');
};
