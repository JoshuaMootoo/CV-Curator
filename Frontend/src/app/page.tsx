'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useCVContext } from '@/context/CVContext';

export default function DashboardPage() {
  const { profile, experiences, projects, educations, skills, loading, error, loadAll } = useCVContext();

  useEffect(() => { loadAll(); }, [loadAll]);

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of your stored CV data</p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700 text-sm">
          {error} — Make sure the backend is running on{' '}
          <code className="font-mono bg-red-100 px-1 rounded">http://localhost:5000</code>
        </div>
      )}

      {/* Profile summary card */}
      <div className="card">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="section-title mb-1">Profile</h2>
            {profile ? (
              <div className="space-y-0.5 text-sm text-gray-600">
                <p className="text-base font-semibold text-gray-900">{profile.name}</p>
                <p>{profile.email}</p>
                <p>{profile.location}</p>
                {profile.summary && (
                  <p className="mt-2 text-gray-500 max-w-lg leading-relaxed">{profile.summary}</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No profile yet</p>
            )}
          </div>
          <Link href="/editor" className="btn-secondary text-sm">Edit</Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Work Experience" count={experiences.length} href="/editor" color="blue" />
        <StatCard label="Projects"        count={projects.length}    href="/editor" color="green" />
        <StatCard label="Education"       count={educations.length}  href="/editor" color="purple" />
        <StatCard label="Skills"          count={skills.length}      href="/editor" color="orange" />
      </div>

      {/* Recent experience */}
      {experiences.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title mb-0">Recent Experience</h2>
            <Link href="/editor" className="text-sm text-blue-600 hover:underline">View all</Link>
          </div>
          <div className="space-y-4">
            {experiences.slice(0, 3).map(exp => (
              <div key={exp.id} className="border-l-2 border-blue-200 pl-4">
                <p className="font-medium text-gray-900">{exp.role}</p>
                <p className="text-sm text-gray-500">{exp.company}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {exp.skills.slice(0, 5).map(skill => (
                    <span key={skill} className="badge-blue">{skill}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="card bg-gradient-to-r from-blue-600 to-blue-700 border-0 text-white">
        <h2 className="text-lg font-semibold mb-1">Ready to generate your CV?</h2>
        <p className="text-blue-100 text-sm mb-4">
          Paste a job description and we&apos;ll tailor your CV to match.
        </p>
        <Link href="/generate" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-blue-700 font-medium hover:bg-blue-50 transition-colors">
          Generate tailored CV →
        </Link>
      </div>
    </div>
  );
}

function StatCard({
  label, count, href, color
}: {
  label: string; count: number; href: string; color: 'blue' | 'green' | 'purple' | 'orange';
}) {
  const colors = {
    blue:   'bg-blue-50 text-blue-700',
    green:  'bg-green-50 text-green-700',
    purple: 'bg-purple-50 text-purple-700',
    orange: 'bg-orange-50 text-orange-700',
  };
  return (
    <Link href={href} className={`card hover:shadow-md transition-shadow ${colors[color]}`}>
      <p className="text-3xl font-bold">{count}</p>
      <p className="text-sm font-medium mt-1 opacity-80">{label}</p>
    </Link>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-48" />
      <div className="card h-32" />
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="card h-20" />)}
      </div>
    </div>
  );
}
