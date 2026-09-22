import {
  UserProfile,
  WorkExperience,
  Project,
  Education,
  Skill,
  GenerateCVRequest,
  GeneratedCV,
} from './types';

// Uses Next.js rewrites to proxy /api/* → http://localhost:5000/api/*
const BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

// ─── Profile ─────────────────────────────────────────────────────────────────

export const profileApi = {
  get: () => request<UserProfile>('/profile'),
  upsert: (data: UserProfile) =>
    request<UserProfile>('/profile', {
      method: data.id ? 'PUT' : 'POST',
      body: JSON.stringify(data),
    }),
};

// ─── Work Experience ──────────────────────────────────────────────────────────

export const experienceApi = {
  getAll: () => request<WorkExperience[]>('/experience'),
  create: (data: WorkExperience) =>
    request<WorkExperience>('/experience', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: WorkExperience) =>
    request<WorkExperience>(`/experience/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    request<void>(`/experience/${id}`, { method: 'DELETE' }),
};

// ─── Projects ─────────────────────────────────────────────────────────────────

export const projectsApi = {
  getAll: () => request<Project[]>('/projects'),
  create: (data: Project) =>
    request<Project>('/projects', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Project) =>
    request<Project>(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    request<void>(`/projects/${id}`, { method: 'DELETE' }),
};

// ─── Education ────────────────────────────────────────────────────────────────

export const educationApi = {
  getAll: () => request<Education[]>('/education'),
  create: (data: Education) =>
    request<Education>('/education', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Education) =>
    request<Education>(`/education/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    request<void>(`/education/${id}`, { method: 'DELETE' }),
};

// ─── Skills ───────────────────────────────────────────────────────────────────

export const skillsApi = {
  getAll: () => request<Skill[]>('/skills'),
  create: (data: Skill) =>
    request<Skill>('/skills', { method: 'POST', body: JSON.stringify(data) }),
  delete: (id: string) =>
    request<void>(`/skills/${id}`, { method: 'DELETE' }),
};

// ─── CV Generation ────────────────────────────────────────────────────────────

export const cvApi = {
  generate: (data: GenerateCVRequest) =>
    request<GeneratedCV>('/generate-cv', { method: 'POST', body: JSON.stringify(data) }),
};
