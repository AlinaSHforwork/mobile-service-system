const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getCsrfToken() {
  if (typeof document === "undefined") return null;
  const cookies = document.cookie.split(";");
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === "csrf-token") return decodeURIComponent(value);
  }
  return null;
}

function getAccessToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
}

async function apiFetch(path, options = {}) {
  const csrfToken = getCsrfToken();
  const accessToken = getAccessToken();

  const headers = {
    "Content-Type": "application/json",
    ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    ...(csrfToken && { "x-csrf-token": csrfToken }),
    ...options.headers,
  };

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  return res.json();
}

class AuthAPI {
  async login(username, password) {
    const csrfToken = getCsrfToken();
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(csrfToken && { "x-csrf-token": csrfToken }),
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
        ...(csrfToken && { "x-csrf-token": csrfToken }),
      },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    });
    return res.json();
  }

  async logout(refreshToken) {
    return apiFetch("/api/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
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
        ...(csrfToken && { "x-csrf-token": csrfToken }),
      },
      credentials: "include",
      body: JSON.stringify({ refreshToken }),
    });
    return res.json();
  }
}

class OrdersAPI {
  async create(data) {
    return apiFetch("/api/orders", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async list({ search = "", status = "", page = 1, limit = 20 } = {}) {
    const params = new URLSearchParams({ search, status, page, limit });
    return apiFetch(`/api/orders?${params}`);
  }

  async get(id) {
    return apiFetch(`/api/orders/${id}`);
  }

  async update(id, data) {
    return apiFetch(`/api/orders/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async delete(id) {
    return apiFetch(`/api/orders/${id}`, { method: "DELETE" });
  }
}

export const authAPI = new AuthAPI();
export const ordersAPI = new OrdersAPI();