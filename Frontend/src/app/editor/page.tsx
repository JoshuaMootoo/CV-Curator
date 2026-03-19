'use client';

import { useEffect, useState } from 'react';
import { useCVContext } from '@/context/CVContext';
import ExperienceForm from '@/components/ExperienceForm';
import ProjectForm from '@/components/ProjectForm';
import EducationForm from '@/components/EducationForm';
import { UserProfile, WorkExperience, Project, Education, Skill } from '@/lib/types';

type Tab = 'profile' | 'experience' | 'projects' | 'education' | 'skills';

export default function EditorPage() {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const { loadAll } = useCVContext();

  useEffect(() => { loadAll(); }, [loadAll]);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'profile',    label: 'Profile'     },
    { id: 'experience', label: 'Experience'  },
    { id: 'projects',   label: 'Projects'    },
    { id: 'education',  label: 'Education'   },
    { id: 'skills',     label: 'Skills'      },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">CV Editor</h1>
        <p className="text-gray-500 mt-1">Manage your CV data</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-gray-200">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'profile'    && <ProfileSection />}
        {activeTab === 'experience' && <ExperienceSection />}
        {activeTab === 'projects'   && <ProjectsSection />}
        {activeTab === 'education'  && <EducationSection />}
        {activeTab === 'skills'     && <SkillsSection />}
      </div>
    </div>
  );
}

// ─── Profile tab ──────────────────────────────────────────────────────────────

function ProfileSection() {
  const { profile, saveProfile, loading } = useCVContext();
  const [form, setForm] = useState<UserProfile>(
    profile ?? { name: '', email: '', location: '', summary: '', links: {} }
  );
  const [saved, setSaved] = useState(false);

  // Sync when context loads
  useEffect(() => { if (profile) setForm(profile); }, [profile]);

  const set = (field: keyof UserProfile, value: unknown) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveProfile(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <form onSubmit={handleSubmit} className="card space-y-4 max-w-2xl">
      <h2 className="section-title">Personal Information</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Full Name *</label>
          <input className="input" required value={form.name}
            onChange={e => set('name', e.target.value)} />
        </div>
        <div>
          <label className="label">Email *</label>
          <input type="email" className="input" required value={form.email}
            onChange={e => set('email', e.target.value)} />
        </div>
        <div>
          <label className="label">Location</label>
          <input className="input" placeholder="e.g. London, UK" value={form.location}
            onChange={e => set('location', e.target.value)} />
        </div>
      </div>
      <div>
        <label className="label">Professional Summary</label>
        <textarea className="input min-h-[100px] resize-y" value={form.summary}
          placeholder="A brief summary of your professional background…"
          onChange={e => set('summary', e.target.value)} />
      </div>
      <h3 className="font-medium text-gray-700 pt-2">Links</h3>
      <div className="grid grid-cols-1 gap-3">
        {(['gitHub', 'linkedIn', 'portfolio'] as const).map(key => (
          <div key={key}>
            <label className="label capitalize">{key === 'gitHub' ? 'GitHub' : key === 'linkedIn' ? 'LinkedIn' : 'Portfolio'}</label>
            <input type="url" className="input" placeholder={`https://…`}
              value={(form.links as Record<string, string | undefined>)[key] ?? ''}
              onChange={e => set('links', { ...form.links, [key]: e.target.value })} />
          </div>
        ))}
      </div>
      <button type="submit" className="btn-primary" disabled={loading}>
        {saved ? '✓ Saved!' : loading ? 'Saving…' : 'Save Profile'}
      </button>
    </form>
  );
}

// ─── Experience tab ───────────────────────────────────────────────────────────

function ExperienceSection() {
  const { experiences, addExperience, updateExperience, deleteExperience, loading } = useCVContext();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<WorkExperience | null>(null);

  const formatDate = (d: string | null | undefined) => {
    if (!d) return 'Present';
    return new Date(d).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-4">
      {/* Existing entries */}
      {experiences.map(exp => (
        <div key={exp.id} className="card">
          {editing?.id === exp.id ? (
            <ExperienceForm
              initial={editing ?? undefined}
              loading={loading}
              onCancel={() => setEditing(null)}
              onSave={async data => { await updateExperience(exp.id!, data); setEditing(null); }}
            />
          ) : (
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{exp.role}</p>
                  <p className="text-sm text-gray-500">{exp.company} · {formatDate(exp.startDate)} – {formatDate(exp.endDate)}</p>
                </div>
                <div className="flex gap-2">
                  <button className="btn-secondary text-sm" onClick={() => setEditing(exp)}>Edit</button>
                  <button className="btn-danger" onClick={() => deleteExperience(exp.id!)}>Delete</button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {exp.skills.map(s => <span key={s} className="badge-blue">{s}</span>)}
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Add new */}
      {showForm ? (
        <div className="card">
          <h3 className="section-title">Add Experience</h3>
          <ExperienceForm
            loading={loading}
            onCancel={() => setShowForm(false)}
            onSave={async data => { await addExperience(data); setShowForm(false); }}
          />
        </div>
      ) : (
        <button className="btn-primary" onClick={() => setShowForm(true)}>+ Add Experience</button>
      )}
    </div>
  );
}

// ─── Projects tab ─────────────────────────────────────────────────────────────

function ProjectsSection() {
  const { projects, addProject, updateProject, deleteProject, loading } = useCVContext();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);

  return (
    <div className="space-y-4">
      {projects.map(proj => (
        <div key={proj.id} className="card">
          {editing?.id === proj.id ? (
            <ProjectForm
              initial={editing ?? undefined}
              loading={loading}
              onCancel={() => setEditing(null)}
              onSave={async data => { await updateProject(proj.id!, data); setEditing(null); }}
            />
          ) : (
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{proj.name}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{proj.description}</p>
                </div>
                <div className="flex gap-2">
                  <button className="btn-secondary text-sm" onClick={() => setEditing(proj)}>Edit</button>
                  <button className="btn-danger" onClick={() => deleteProject(proj.id!)}>Delete</button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {proj.techStack.map(t => <span key={t} className="badge-green">{t}</span>)}
              </div>
            </div>
          )}
        </div>
      ))}

      {showForm ? (
        <div className="card">
          <h3 className="section-title">Add Project</h3>
          <ProjectForm
            loading={loading}
            onCancel={() => setShowForm(false)}
            onSave={async data => { await addProject(data); setShowForm(false); }}
          />
        </div>
      ) : (
        <button className="btn-primary" onClick={() => setShowForm(true)}>+ Add Project</button>
      )}
    </div>
  );
}

// ─── Education tab ────────────────────────────────────────────────────────────

function EducationSection() {
  const { educations, addEducation, updateEducation, deleteEducation, loading } = useCVContext();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Education | null>(null);

  const formatDate = (d: string | null | undefined) => {
    if (!d) return 'Present';
    return new Date(d).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-4">
      {educations.map(edu => (
        <div key={edu.id} className="card">
          {editing?.id === edu.id ? (
            <EducationForm
              initial={editing ?? undefined}
              loading={loading}
              onCancel={() => setEditing(null)}
              onSave={async data => { await updateEducation(edu.id!, data); setEditing(null); }}
            />
          ) : (
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-gray-900">{edu.course}</p>
                <p className="text-sm text-gray-500">{edu.institution} · {formatDate(edu.startDate)} – {formatDate(edu.endDate)}</p>
                {edu.grade && <p className="text-xs text-gray-400 mt-0.5">{edu.grade}</p>}
              </div>
              <div className="flex gap-2">
                <button className="btn-secondary text-sm" onClick={() => setEditing(edu)}>Edit</button>
                <button className="btn-danger" onClick={() => deleteEducation(edu.id!)}>Delete</button>
              </div>
            </div>
          )}
        </div>
      ))}

      {showForm ? (
        <div className="card">
          <h3 className="section-title">Add Education</h3>
          <EducationForm
            loading={loading}
            onCancel={() => setShowForm(false)}
            onSave={async data => { await addEducation(data); setShowForm(false); }}
          />
        </div>
      ) : (
        <button className="btn-primary" onClick={() => setShowForm(true)}>+ Add Education</button>
      )}
    </div>
  );
}

// ─── Skills tab ───────────────────────────────────────────────────────────────

function SkillsSection() {
  const { skills, addSkill, deleteSkill, loading } = useCVContext();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const skill: Skill = { name: name.trim(), category: category.trim() || undefined };
    await addSkill(skill);
    setName('');
    setCategory('');
  };

  // Group skills by category
  const grouped = skills.reduce<Record<string, Skill[]>>((acc, skill) => {
    const cat = skill.category ?? 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {/* Add skill form */}
      <div className="card max-w-lg">
        <h2 className="section-title">Add Skill</h2>
        <form onSubmit={handleAdd} className="flex gap-2">
          <input className="input" placeholder="Skill name" required value={name}
            onChange={e => setName(e.target.value)} />
          <input className="input w-40" placeholder="Category" value={category}
            onChange={e => setCategory(e.target.value)} />
          <button type="submit" className="btn-primary shrink-0" disabled={loading}>Add</button>
        </form>
      </div>

      {/* Grouped skill chips */}
      {Object.entries(grouped).map(([cat, catSkills]) => (
        <div key={cat} className="card">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{cat}</h3>
          <div className="flex flex-wrap gap-2">
            {catSkills.map(skill => (
              <div key={skill.id}
                className="flex items-center gap-1 badge-gray px-2.5 py-1 text-sm">
                <span>{skill.name}</span>
                <button className="ml-1 text-gray-400 hover:text-red-500 transition-colors"
                  onClick={() => deleteSkill(skill.id!)}>✕</button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
