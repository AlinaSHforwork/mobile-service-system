const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const REQUEST_TIMEOUT_MS = 15_000;

function getCsrfToken() {
  if (typeof document === "undefined") return null;
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, ...rest] = cookie.trim().split("=");
    if (name === "csrf-token") {
      const value = decodeURIComponent(rest.join("="));
      if (/^[0-9a-f]{64}$/i.test(value)) return value;
    }
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

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
      credentials: "include",
      signal: controller.signal,
    });
    clearTimeout(timer);
    return res.json();
  } catch (err) {
    clearTimeout(timer);
    if (err.name === "AbortError") {
      throw new Error("Request timed out. Please check your connection.");
    }
    throw err;
  }
}

class AuthAPI {
  async _authPost(endpoint, body) {
    const csrfToken = getCsrfToken();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(csrfToken && { "x-csrf-token": csrfToken }),
        },
        credentials: "include",
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timer);
      return res.json();
    } catch (err) {
      clearTimeout(timer);
      if (err.name === "AbortError") throw new Error("Request timed out.");
      throw err;
    }
  }

  login(username, password) {
    return this._authPost("/api/auth/login", { username, password });
  }

  register(username, password) {
    return this._authPost("/api/auth/register", { username, password });
  }

  logout(refreshToken) {
    return apiFetch("/api/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
  }

  async me(accessToken) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        credentials: "include",
        signal: controller.signal,
      });
      clearTimeout(timer);
      return res.json();
    } catch (err) {
      clearTimeout(timer);
      if (err.name === "AbortError") throw new Error("Request timed out.");
      throw err;
    }
  }

  refresh(refreshToken) {
    return this._authPost("/api/auth/refresh", { refreshToken });
  }
}

class OrdersAPI {
  create(data) {
    return apiFetch("/api/orders", { method: "POST", body: JSON.stringify(data) });
  }

  list({ search = "", status = "", page = 1, limit = 20 } = {}) {
    const params = new URLSearchParams({
      search: search.slice(0, 200), 
      status,
      page: String(page),
      limit: String(limit),
    });
    return apiFetch(`/api/orders?${params}`);
  }

  getMyOrders({ search = "", status = "", page = 1, limit = 20 } = {}) {
    const params = new URLSearchParams({ search: search.slice(0, 200), status, page, limit });
    return apiFetch(`/api/orders/my/orders?${params}`);
  }

  getAvailable({ search = "", status = "new", page = 1, limit = 20 } = {}) {
    const params = new URLSearchParams({ search: search.slice(0, 200), status, page, limit });
    return apiFetch(`/api/orders?${params}`);
  }

  get(id) {
    if (!/^[0-9a-f-]{36}$/i.test(id)) return Promise.resolve({ success: false, message: "Invalid order ID" });
    return apiFetch(`/api/orders/${id}`);
  }

  update(id, data) {
    if (!/^[0-9a-f-]{36}$/i.test(id)) return Promise.resolve({ success: false, message: "Invalid order ID" });
    return apiFetch(`/api/orders/${id}`, { method: "PUT", body: JSON.stringify(data) });
  }

  assign(id) {
    if (!/^[0-9a-f-]{36}$/i.test(id)) return Promise.resolve({ success: false, message: "Invalid order ID" });
    return apiFetch(`/api/orders/${id}/assign`, { method: "PUT" });
  }

  delete(id) {
    if (!/^[0-9a-f-]{36}$/i.test(id)) return Promise.resolve({ success: false, message: "Invalid order ID" });
    return apiFetch(`/api/orders/${id}`, { method: "DELETE" });
  }

  sendMessage(orderId, content) {
    if (!/^[0-9a-f-]{36}$/i.test(orderId)) return Promise.resolve({ success: false, message: "Invalid order ID" });
    const safeContent = String(content).trim().slice(0, 2000);
    return apiFetch(`/api/orders/${orderId}/messages`, {
      method: "POST",
      body: JSON.stringify({ content: safeContent }),
    });
  }

  getMessages(orderId, { page = 1, limit = 50 } = {}) {
    if (!/^[0-9a-f-]{36}$/i.test(orderId)) return Promise.resolve({ success: false, message: "Invalid order ID" });
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    return apiFetch(`/api/orders/${orderId}/messages?${params}`);
  }
}

export const authAPI = new AuthAPI();
export const ordersAPI = new OrdersAPI();