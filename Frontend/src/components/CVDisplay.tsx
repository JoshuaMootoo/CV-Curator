'use client';

import { useState } from 'react';
import { GeneratedCV } from '@/lib/types';

interface Props {
  cv: GeneratedCV;
}

export default function CVDisplay({ cv }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(cv.formattedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'Present';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Keywords banner */}
      {cv.extractedKeywords.length > 0 && (
        <div className="card bg-blue-50 border-blue-200">
          <p className="text-sm font-medium text-blue-700 mb-2">
            Extracted {cv.extractedKeywords.length} keywords from job description:
          </p>
          <div className="flex flex-wrap gap-1">
            {cv.extractedKeywords.slice(0, 30).map(kw => (
              <span key={kw} className="badge-blue">{kw}</span>
            ))}
            {cv.extractedKeywords.length > 30 && (
              <span className="badge-gray">+{cv.extractedKeywords.length - 30} more</span>
            )}
          </div>
        </div>
      )}

      {/* Copy plain text button */}
      <div className="flex justify-end">
        <button onClick={handleCopy} className="btn-secondary">
          {copied ? '✓ Copied!' : 'Copy plain text'}
        </button>
      </div>

      {/* ── Personal Info ── */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900">{cv.personalInfo.name}</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          {cv.personalInfo.email} · {cv.personalInfo.location}
        </p>
        <div className="flex gap-3 mt-2 text-sm">
          {cv.personalInfo.links.linkedIn && (
            <a href={cv.personalInfo.links.linkedIn} target="_blank" rel="noreferrer"
              className="text-blue-600 hover:underline">LinkedIn</a>
          )}
          {cv.personalInfo.links.gitHub && (
            <a href={cv.personalInfo.links.gitHub} target="_blank" rel="noreferrer"
              className="text-blue-600 hover:underline">GitHub</a>
          )}
          {cv.personalInfo.links.portfolio && (
            <a href={cv.personalInfo.links.portfolio} target="_blank" rel="noreferrer"
              className="text-blue-600 hover:underline">Portfolio</a>
          )}
        </div>
        {cv.summary && <p className="mt-3 text-sm text-gray-600 leading-relaxed">{cv.summary}</p>}
      </div>

      {/* ── Experience ── */}
      {cv.experience.length > 0 && (
        <div className="card">
          <h3 className="section-title">Experience</h3>
          <div className="space-y-5">
            {cv.experience.map(exp => (
              <div key={exp.id} className="border-l-2 border-blue-300 pl-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-gray-900">{exp.role}</p>
                    <p className="text-sm text-gray-600">{exp.company}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-gray-500">
                      {formatDate(exp.startDate)} – {formatDate(exp.endDate)}
                    </p>
                    <RelevanceBadge score={exp.relevanceScore} />
                  </div>
                </div>
                <ul className="mt-2 space-y-1">
                  {exp.bulletPoints.map((bp, i) => (
                    <li key={i} className="text-sm text-gray-700 flex gap-2">
                      <span className="text-blue-400 shrink-0">•</span>
                      <span>{bp}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-1 mt-2">
                  {exp.skills.map(s => (
                    <span key={s} className="badge-blue">{s}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Projects ── */}
      {cv.projects.length > 0 && (
        <div className="card">
          <h3 className="section-title">Projects</h3>
          <div className="space-y-4">
            {cv.projects.map(proj => (
              <div key={proj.id} className="border-l-2 border-green-300 pl-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {proj.link ? (
                        <a href={proj.link} target="_blank" rel="noreferrer"
                          className="hover:underline text-blue-700">{proj.name}</a>
                      ) : proj.name}
                    </p>
                    <p className="text-sm text-gray-600 mt-0.5">{proj.description}</p>
                  </div>
                  <RelevanceBadge score={proj.relevanceScore} />
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {proj.techStack.map(t => (
                    <span key={t} className="badge-green">{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Education ── */}
      {cv.education.length > 0 && (
        <div className="card">
          <h3 className="section-title">Education</h3>
          <div className="space-y-3">
            {cv.education.map(edu => (
              <div key={edu.id} className="border-l-2 border-purple-300 pl-4">
                <p className="font-semibold text-gray-900">{edu.course}</p>
                <p className="text-sm text-gray-600">{edu.institution}</p>
                <p className="text-xs text-gray-400">
                  {formatDate(edu.startDate)} – {formatDate(edu.endDate)}
                  {edu.grade && ` · ${edu.grade}`}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Skills ── */}
      {cv.skills.length > 0 && (
        <div className="card">
          <h3 className="section-title">Skills</h3>
          <div className="flex flex-wrap gap-1.5">
            {cv.skills.map(skill => (
              <span key={skill} className="badge-gray text-sm px-3 py-1">{skill}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RelevanceBadge({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const color = pct >= 60 ? 'text-green-600 bg-green-50' : pct >= 30 ? 'text-yellow-600 bg-yellow-50' : 'text-gray-500 bg-gray-50';
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${color}`}>
      {pct}% match
    </span>
  );
}
