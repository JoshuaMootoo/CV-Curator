'use client';

import { useState } from 'react';
import { Education } from '@/lib/types';

interface Props {
  initial?: Education;
  onSave: (data: Education) => void;
  onCancel: () => void;
  loading?: boolean;
}

const empty: Education = { institution: '', course: '', startDate: '', endDate: null, grade: '' };

export default function EducationForm({ initial, onSave, onCancel, loading }: Props) {
  const [form, setForm] = useState<Education>(initial ?? empty);

  const set = (field: keyof Education, value: unknown) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Institution *</label>
          <input className="input" required value={form.institution}
            onChange={e => set('institution', e.target.value)} />
        </div>
        <div>
          <label className="label">Course / Degree *</label>
          <input className="input" required value={form.course}
            onChange={e => set('course', e.target.value)} />
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
        <div>
          <label className="label">Grade <span className="text-gray-400 font-normal">(optional)</span></label>
          <input className="input" placeholder="e.g. First Class Honours, 3.8 GPA"
            value={form.grade ?? ''}
            onChange={e => set('grade', e.target.value)} />
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saving…' : 'Save Education'}
        </button>
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
