const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Helper to get CSRF token from cookies
function getCsrfToken() {
  if (typeof document === 'undefined') return null;
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'csrf-token') return decodeURIComponent(value);
  }
  return null;
}

class AuthAPI {
  async login(username, password) {
    const csrfToken = getCsrfToken();
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        ...(csrfToken && { "x-csrf-token": csrfToken })
      },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    });
    return res.json();
  }

  async register(username, password) {
    const csrfToken = getCsrfToken();
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        ...(csrfToken && { "x-csrf-token": csrfToken })
      },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    });
    return res.json();
  }

  async logout(refreshToken) {
    const csrfToken = getCsrfToken();
    const res = await fetch(`${API_URL}/api/auth/logout`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        ...(csrfToken && { "x-csrf-token": csrfToken })
      },
      credentials: "include",
      body: JSON.stringify({ refreshToken }),
    });
    return res.json();
  }

  async me(accessToken) {
    const res = await fetch(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      credentials: "include",
    });
    return res.json();
  }

  async refresh(refreshToken) {
    const csrfToken = getCsrfToken();
    const res = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        ...(csrfToken && { "x-csrf-token": csrfToken })
      },
      credentials: "include",
      body: JSON.stringify({ refreshToken }),
    });
    return res.json();
  }
}

export const authAPI = new AuthAPI();
