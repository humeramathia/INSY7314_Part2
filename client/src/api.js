const TOKEN_KEY = "hh_token";

export const API_URL = import.meta.env.VITE_API_URL || "https://localhost:3000";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request(path, { method = "GET", body, auth = false } = {}) {
  const headers = {};
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (auth) {
    const token = getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Could not reach the API. Is https://localhost:3000 running?", 0);
  }

  const json = await response.json().catch(() => ({}));

  if (!response.ok || json.success === false) {
    throw new ApiError(json.message || "Request failed", response.status);
  }

  return json.data;
}

export function register(payload) {
  return request("/api/auth/register", { method: "POST", body: payload });
}

export function login(payload) {
  return request("/api/auth/login", { method: "POST", body: payload });
}

export function me() {
  return request("/api/auth/me", { auth: true });
}

export function listGigs() {
  return request("/api/gigs");
}

export function getGig(id) {
  return request(`/api/gigs/${id}`);
}

export function createGig(payload) {
  return request("/api/gigs", { method: "POST", body: payload, auth: true });
}

export function updateGig(id, payload) {
  return request(`/api/gigs/${id}`, { method: "PUT", body: payload, auth: true });
}

export function deleteGig(id) {
  return request(`/api/gigs/${id}`, { method: "DELETE", auth: true });
}

export function myGigs() {
  return request("/api/gigs/mine", { auth: true });
}

export function createBooking(gigId) {
  return request("/api/bookings", { method: "POST", body: { gigId }, auth: true });
}

export function myBookings() {
  return request("/api/bookings/mine", { auth: true });
}

export function confirmBooking(id) {
  return request(`/api/bookings/${id}/confirm`, { method: "POST", auth: true });
}

export function myTransactions() {
  return request("/api/transactions/mine", { auth: true });
}

export function adminGigs() {
  return request("/api/admin/gigs", { auth: true });
}
