'use client';

import { useState } from 'react';
import { WorkExperience } from '@/lib/types';

interface Props {
  initial?: WorkExperience;
  onSave: (data: WorkExperience) => void;
  onCancel: () => void;
  loading?: boolean;
}

const empty: WorkExperience = {
  company: '', role: '', startDate: '', endDate: null,
  bulletPoints: [''], skills: [],
};

export default function ExperienceForm({ initial, onSave, onCancel, loading }: Props) {
  const [form, setForm] = useState<WorkExperience>(initial ?? empty);
  const [skillInput, setSkillInput] = useState('');

  const set = (field: keyof WorkExperience, value: unknown) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const updateBullet = (index: number, value: string) => {
    const bullets = [...form.bulletPoints];
    bullets[index] = value;
    set('bulletPoints', bullets);
  };

  const addBullet = () => set('bulletPoints', [...form.bulletPoints, '']);

  const removeBullet = (index: number) =>
    set('bulletPoints', form.bulletPoints.filter((_, i) => i !== index));

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !form.skills.includes(trimmed)) {
      set('skills', [...form.skills, trimmed]);
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) =>
    set('skills', form.skills.filter(s => s !== skill));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...form, bulletPoints: form.bulletPoints.filter(b => b.trim()) });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Company *</label>
          <input className="input" required value={form.company}
            onChange={e => set('company', e.target.value)} />
        </div>
        <div>
          <label className="label">Role / Title *</label>
          <input className="input" required value={form.role}
            onChange={e => set('role', e.target.value)} />
        </div>
        <div>
          <label className="label">Start Date *</label>
          <input type="month" className="input" required
            value={form.startDate ? form.startDate.slice(0, 7) : ''}
            onChange={e => set('startDate', `${e.target.value}-01`)} />
        </div>
        <div>
          <label className="label">End Date <span className="text-gray-400 font-normal">(leave empty = present)</span></label>
          <input type="month" className="input"
            value={form.endDate ? form.endDate.slice(0, 7) : ''}
            onChange={e => set('endDate', e.target.value ? `${e.target.value}-01` : null)} />
        </div>
      </div>

      {/* Bullet points */}
      <div>
        <label className="label">Bullet Points</label>
        <div className="space-y-2">
          {form.bulletPoints.map((bullet, i) => (
            <div key={i} className="flex gap-2">
              <input className="input" placeholder="e.g. Built a REST API that reduced latency by 30%"
                value={bullet} onChange={e => updateBullet(i, e.target.value)} />
              {form.bulletPoints.length > 1 && (
                <button type="button" className="btn-danger px-2" onClick={() => removeBullet(i)}>✕</button>
              )}
            </div>
          ))}
          <button type="button" className="btn-secondary text-sm" onClick={addBullet}>
            + Add bullet
          </button>
        </div>
      </div>

      {/* Skills */}
      <div>
        <label className="label">Skills / Technologies</label>
        <div className="flex gap-2 mb-2">
          <input className="input" placeholder="e.g. React, Docker, Python…"
            value={skillInput} onChange={e => setSkillInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }} />
          <button type="button" className="btn-secondary shrink-0" onClick={addSkill}>Add</button>
        </div>
        <div className="flex flex-wrap gap-1">
          {form.skills.map(skill => (
            <span key={skill} className="badge-blue cursor-pointer hover:bg-blue-200 transition-colors"
              onClick={() => removeSkill(skill)}>
              {skill} ✕
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saving…' : 'Save Experience'}
        </button>
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
