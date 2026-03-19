'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
  UserProfile,
  WorkExperience,
  Project,
  Education,
  Skill,
  GeneratedCV,
} from '@/lib/types';
import { profileApi, experienceApi, projectsApi, educationApi, skillsApi } from '@/lib/api';

interface CVContextValue {
  // Data
  profile: UserProfile | null;
  experiences: WorkExperience[];
  projects: Project[];
  educations: Education[];
  skills: Skill[];
  generatedCV: GeneratedCV | null;
  loading: boolean;
  error: string | null;

  // Actions
  loadAll: () => Promise<void>;
  saveProfile: (p: UserProfile) => Promise<void>;
  addExperience: (e: WorkExperience) => Promise<void>;
  updateExperience: (id: string, e: WorkExperience) => Promise<void>;
  deleteExperience: (id: string) => Promise<void>;
  addProject: (p: Project) => Promise<void>;
  updateProject: (id: string, p: Project) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  addEducation: (e: Education) => Promise<void>;
  updateEducation: (id: string, e: Education) => Promise<void>;
  deleteEducation: (id: string) => Promise<void>;
  addSkill: (s: Skill) => Promise<void>;
  deleteSkill: (id: string) => Promise<void>;
  setGeneratedCV: (cv: GeneratedCV | null) => void;
}

const CVContext = createContext<CVContextValue | null>(null);

export function CVProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [experiences, setExperiences] = useState<WorkExperience[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [educations, setEducations] = useState<Education[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [generatedCV, setGeneratedCV] = useState<GeneratedCV | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const withLoading = useCallback(async (fn: () => Promise<void>) => {
    setLoading(true);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAll = useCallback(() =>
    withLoading(async () => {
      const [p, exp, proj, edu, sk] = await Promise.all([
        profileApi.get().catch(() => null),
        experienceApi.getAll(),
        projectsApi.getAll(),
        educationApi.getAll(),
        skillsApi.getAll(),
      ]);
      setProfile(p);
      setExperiences(exp);
      setProjects(proj);
      setEducations(edu);
      setSkills(sk);
    }), [withLoading]);

  const saveProfile = useCallback((p: UserProfile) =>
    withLoading(async () => {
      const saved = await profileApi.upsert(p);
      setProfile(saved);
    }), [withLoading]);

  const addExperience = useCallback((e: WorkExperience) =>
    withLoading(async () => {
      const created = await experienceApi.create(e);
      setExperiences(prev => [...prev, created]);
    }), [withLoading]);

  const updateExperience = useCallback((id: string, e: WorkExperience) =>
    withLoading(async () => {
      const updated = await experienceApi.update(id, e);
      setExperiences(prev => prev.map(x => x.id === id ? updated : x));
    }), [withLoading]);

  const deleteExperience = useCallback((id: string) =>
    withLoading(async () => {
      await experienceApi.delete(id);
      setExperiences(prev => prev.filter(x => x.id !== id));
    }), [withLoading]);

  const addProject = useCallback((p: Project) =>
    withLoading(async () => {
      const created = await projectsApi.create(p);
      setProjects(prev => [...prev, created]);
    }), [withLoading]);

  const updateProject = useCallback((id: string, p: Project) =>
    withLoading(async () => {
      const updated = await projectsApi.update(id, p);
      setProjects(prev => prev.map(x => x.id === id ? updated : x));
    }), [withLoading]);

  const deleteProject = useCallback((id: string) =>
    withLoading(async () => {
      await projectsApi.delete(id);
      setProjects(prev => prev.filter(x => x.id !== id));
    }), [withLoading]);

  const addEducation = useCallback((e: Education) =>
    withLoading(async () => {
      const created = await educationApi.create(e);
      setEducations(prev => [...prev, created]);
    }), [withLoading]);

  const updateEducation = useCallback((id: string, e: Education) =>
    withLoading(async () => {
      const updated = await educationApi.update(id, e);
      setEducations(prev => prev.map(x => x.id === id ? updated : x));
    }), [withLoading]);

  const deleteEducation = useCallback((id: string) =>
    withLoading(async () => {
      await educationApi.delete(id);
      setEducations(prev => prev.filter(x => x.id !== id));
    }), [withLoading]);

  const addSkill = useCallback((s: Skill) =>
    withLoading(async () => {
      const created = await skillsApi.create(s);
      setSkills(prev => [...prev, created]);
    }), [withLoading]);

  const deleteSkill = useCallback((id: string) =>
    withLoading(async () => {
      await skillsApi.delete(id);
      setSkills(prev => prev.filter(x => x.id !== id));
    }), [withLoading]);

  return (
    <CVContext.Provider value={{
      profile, experiences, projects, educations, skills,
      generatedCV, loading, error,
      loadAll, saveProfile,
      addExperience, updateExperience, deleteExperience,
      addProject, updateProject, deleteProject,
      addEducation, updateEducation, deleteEducation,
      addSkill, deleteSkill,
      setGeneratedCV,
    }}>
      {children}
    </CVContext.Provider>
  );
}

export function useCVContext() {
  const ctx = useContext(CVContext);
  if (!ctx) throw new Error('useCVContext must be used within CVProvider');
  return ctx;
}
