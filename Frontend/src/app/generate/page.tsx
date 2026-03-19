'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCVContext } from '@/context/CVContext';
import { cvApi } from '@/lib/api';

const EXAMPLE_JOB = `Senior Full Stack Engineer — FinTech Startup

We are looking for a Senior Full Stack Engineer to join our growing engineering team. You will work on our core banking platform, building robust and scalable APIs and modern frontend interfaces.

Requirements:
- 4+ years of experience in software development
- Strong proficiency in React and TypeScript for frontend development
- Backend experience with .NET / C# or Node.js
- Experience with REST API design and microservices architecture
- Proficiency with Docker and Kubernetes for containerised deployments
- Experience with CI/CD pipelines (GitHub Actions or similar)
- Strong knowledge of SQL databases (PostgreSQL preferred)
- Experience with cloud platforms (AWS, GCP, or Azure)
- Excellent communication skills and ability to work in an agile team

Nice to have:
- Redis caching experience
- GraphQL knowledge
- Experience with event-driven architectures (Kafka, RabbitMQ)`;

export default function GeneratePage() {
  const router = useRouter();
  const { setGeneratedCV } = useCVContext();
  const [jobDescription, setJobDescription] = useState('');
  const [maxExperience, setMaxExperience] = useState(5);
  const [maxProjects, setMaxProjects] = useState(4);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobDescription.trim()) return;

    setGenerating(true);
    setError(null);

    try {
      const cv = await cvApi.generate({ jobDescription, maxExperience, maxProjects });
      setGeneratedCV(cv);
      router.push('/output');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate CV');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Generate Tailored CV</h1>
        <p className="text-gray-500 mt-1">
          Paste a job description below and we&apos;ll rank your experience and projects by relevance.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleGenerate} className="space-y-5">
        {/* Job description textarea */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="label mb-0">Job Description *</label>
            <button type="button" className="text-xs text-blue-600 hover:underline"
              onClick={() => setJobDescription(EXAMPLE_JOB)}>
              Load example
            </button>
          </div>
          <textarea
            className="input min-h-[300px] resize-y font-mono text-sm"
            required
            placeholder="Paste the full job description here…"
            value={jobDescription}
            onChange={e => setJobDescription(e.target.value)}
          />
          {jobDescription && (
            <p className="text-xs text-gray-400 mt-1">{jobDescription.length} characters</p>
          )}
        </div>

        {/* Options */}
        <div className="card bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Options</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Max experience entries</label>
              <select className="input" value={maxExperience}
                onChange={e => setMaxExperience(Number(e.target.value))}>
                {[2, 3, 4, 5, 6].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Max project entries</label>
              <select className="input" value={maxProjects}
                onChange={e => setMaxProjects(Number(e.target.value))}>
                {[1, 2, 3, 4, 5].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <button type="submit" className="btn-primary text-base px-6 py-2.5" disabled={generating}>
          {generating ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin">⟳</span> Generating…
            </span>
          ) : (
            'Generate CV →'
          )}
        </button>
      </form>

      {/* How it works */}
      <div className="card bg-blue-50 border-blue-200">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">How it works</h3>
        <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
          <li>Keywords are extracted from the job description</li>
          <li>Your experience and projects are scored by keyword match</li>
          <li>Top entries are selected and reordered by relevance</li>
          <li>Bullet points are reordered to surface relevant ones first</li>
        </ol>
      </div>
    </div>
  );
}
