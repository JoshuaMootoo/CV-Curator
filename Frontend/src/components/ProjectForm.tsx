'use client';

import { useState } from 'react';
import { Project } from '@/lib/types';

interface Props {
  initial?: Project;
  onSave: (data: Project) => void;
  onCancel: () => void;
  loading?: boolean;
}

const empty: Project = { name: '', description: '', techStack: [], link: '' };

export default function ProjectForm({ initial, onSave, onCancel, loading }: Props) {
  const [form, setForm] = useState<Project>(initial ?? empty);
  const [techInput, setTechInput] = useState('');

  const set = (field: keyof Project, value: unknown) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const addTech = () => {
    const trimmed = techInput.trim();
    if (trimmed && !form.techStack.includes(trimmed)) {
      set('techStack', [...form.techStack, trimmed]);
      setTechInput('');
    }
  };

  const removeTech = (tech: string) =>
    set('techStack', form.techStack.filter(t => t !== tech));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Project Name *</label>
        <input className="input" required value={form.name}
          onChange={e => set('name', e.target.value)} />
      </div>

      <div>
        <label className="label">Description *</label>
        <textarea className="input min-h-[80px] resize-y" required value={form.description}
          onChange={e => set('description', e.target.value)} />
      </div>

      <div>
        <label className="label">Tech Stack</label>
        <div className="flex gap-2 mb-2">
          <input className="input" placeholder="e.g. React, Next.js, PostgreSQL…"
            value={techInput} onChange={e => setTechInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTech(); } }} />
          <button type="button" className="btn-secondary shrink-0" onClick={addTech}>Add</button>
        </div>
        <div className="flex flex-wrap gap-1">
          {form.techStack.map(tech => (
            <span key={tech} className="badge-green cursor-pointer hover:bg-green-200 transition-colors"
              onClick={() => removeTech(tech)}>
              {tech} ✕
            </span>
          ))}
        </div>
      </div>

      <div>
        <label className="label">Link <span className="text-gray-400 font-normal">(optional)</span></label>
        <input type="url" className="input" placeholder="https://github.com/…"
          value={form.link ?? ''}
          onChange={e => set('link', e.target.value)} />
      </div>

      <div className="flex gap-2 pt-2">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saving…' : 'Save Project'}
        </button>
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
