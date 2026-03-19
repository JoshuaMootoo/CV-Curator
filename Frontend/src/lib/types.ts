// ─── Domain models (mirrors the C# backend models) ───────────────────────────

export interface ProfileLinks {
  gitHub?: string;
  portfolio?: string;
  linkedIn?: string;
}

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  location: string;
  links: ProfileLinks;
  summary: string;
}

export interface WorkExperience {
  id?: string;
  company: string;
  role: string;
  startDate: string; // ISO date string
  endDate?: string | null;
  bulletPoints: string[];
  skills: string[];
}

export interface Education {
  id?: string;
  institution: string;
  course: string;
  startDate: string;
  endDate?: string | null;
  grade?: string;
}

export interface Project {
  id?: string;
  name: string;
  description: string;
  techStack: string[];
  link?: string;
}

export interface Skill {
  id?: string;
  name: string;
  category?: string;
}

// ─── CV Generation ────────────────────────────────────────────────────────────

export interface GenerateCVRequest {
  jobDescription: string;
  maxExperience?: number;
  maxProjects?: number;
}

export interface ScoredExperience extends WorkExperience {
  relevanceScore: number;
}

export interface ScoredProject extends Project {
  relevanceScore: number;
}

export interface PersonalInfo {
  name: string;
  email: string;
  location: string;
  links: ProfileLinks;
}

export interface GeneratedCV {
  personalInfo: PersonalInfo;
  summary: string;
  experience: ScoredExperience[];
  projects: ScoredProject[];
  education: Education[];
  skills: string[];
  formattedText: string;
  extractedKeywords: string[];
}
