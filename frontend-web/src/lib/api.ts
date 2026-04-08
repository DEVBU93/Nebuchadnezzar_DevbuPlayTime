const apiUrl = 'https://dpngame-backend-6wpc.onrender.com'; // Temporal

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${apiUrl}${endpoint}`;
  const token = localStorage.getItem('token');
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    }
  });

  if (!response.ok) throw new Error(`API: ${response.status}`);
  return response.json();
};

export const login = async (email: string, password: string) => {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
};
